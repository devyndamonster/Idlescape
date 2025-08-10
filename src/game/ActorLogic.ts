import { ActionType } from "@/enums/ActionType";
import { ObjectiveType } from "@/enums/ObjectiveType";
import { Actor } from "@/models/entities/Actor";
import { ActorAction } from "@/models/ActorAction";
import { GameState, getBlueprints } from "@/models/GameState";
import { getNearestEntity, getNearestResource } from "./WorldUtils";
import { ResourceType } from "@/enums/ResourceType";
import { InventoryItem } from "@/models/InventoryItem";
import { Vector2 } from "three";
import { getProvidableItems } from "./BlueprintLogic";
import { EntityType } from "@/enums/EntityType";
import { ItemType } from "@/enums/ItemType";
import { GameData } from "@/models/GameData";
import { AppNode } from "@/state/types";
import { match } from "ts-pattern";

export function getNewActor(location: Vector2): Actor {
    return {
        entityType: EntityType.Actor,
        location: location,
        moveSpeed: 60,
        size: 80,
        icon: "/Idlescape/StickCharacter.svg",
        harvestProgress: 0,
        hunger: 1,
        thirst: 1,
        health: 100,
        maxHealth: 100,
        uuid: crypto.randomUUID(),
        inventory: [...Array(10)].map(_ => ({ item: null, quantity: 0 })),
        strategy: undefined,
    }
}

export function getActorAction(actor: Actor, gameState: GameState, gameData: GameData): ActorAction {
    let action: ActorAction = {
        actionType: ActionType.Idle,
    }
    
    let currentNode: AppNode | undefined = actor.strategy?.nodes.find(node => node.type == "onActorStrategy");

    while(currentNode){
        if(currentNode.type == "onActorStrategy"){
            const nodeId: string = currentNode.id;
            const nextNodeId = actor.strategy?.edges.find(edge => edge.source === nodeId)?.target;
            currentNode = actor.strategy?.nodes.find(node => node.id === nextNodeId);
            continue;
        }
        else if(currentNode.type == "endStrategyNode"){
            const objective = currentNode.data.objective;

            if(objective.objectiveType == ObjectiveType.CollectResource){
                action = tryCollectResource(actor, objective.resourceType, gameState) ?? action;
            }
            else if(objective.objectiveType == ObjectiveType.CraftItem){
                action = tryCraftItem(actor, objective.craftingRecipeId, gameData) ?? action;
            }
            else if(objective.objectiveType == ObjectiveType.BuildStructure){
                action = tryBuildStructure(actor, gameState) ?? action;
            }

            break;
        }
        else if(currentNode.type == "quantityConditionNode"){
            const nodeId: string = currentNode.id;
            const nextNodeIdTrue = actor.strategy?.edges.find(edge => edge.source === nodeId && edge.sourceHandle === "condition-true")?.target;
            const nextNodeIdFalse = actor.strategy?.edges.find(edge => edge.source === nodeId && edge.sourceHandle === "condition-false")?.target;

            const quantitySource = currentNode.data.quantitySource;
            const operator = currentNode.data.operator;
            const itemType = currentNode.data.itemType;
            const targetQuantity = currentNode.data.quantity ?? 0;

            const sourceQuantity = match(quantitySource)
                .with("hunger", () => actor.hunger * 100)
                .with("thirst", () => actor.thirst * 100)
                .with("health", () => (actor.health / actor.maxHealth) * 100)
                .with("item", () => getQuantityAvailableInInventory(actor, itemType))
                .otherwise(() => 0);

            const conditionMet = match(operator)
                .with("=", () => sourceQuantity === targetQuantity)
                .with(">", () => sourceQuantity > targetQuantity)
                .with("<", () => sourceQuantity < targetQuantity)
                .with(">=", () => sourceQuantity >= targetQuantity)
                .with("<=", () => sourceQuantity <= targetQuantity)
                .with("!=", () => sourceQuantity != targetQuantity)
                .otherwise(() => false);

            const nextNodeId = conditionMet ? nextNodeIdTrue : nextNodeIdFalse;
            currentNode = actor.strategy?.nodes.find(node => node.id === nextNodeId);
            continue;
        }
    }

    return action;
}

function tryCollectResource(actor: Actor, resourceType: ResourceType, gameState: GameState): ActorAction | null {
    const nearestResource = getNearestResource(actor.location, resourceType, gameState);
    if(!nearestResource) return null;

    const distance = actor.location.distanceTo(nearestResource.location);
    if(distance <= nearestResource.size){
        return {
            actionType: ActionType.Collect,
            targetResource: nearestResource
        };
    }
    else{
        return {
            actionType: ActionType.Move,
            destination: nearestResource.location,
        };
    }
}

function tryCraftItem(actor: Actor, recipeId: number, gameData: GameData): ActorAction | null {
    const recipe = gameData.craftingRecipes.find(r => r.recipeId === recipeId);
    if(!recipe) return null;
    
    for(const requiredItem of recipe.requiredItems) {
        const availableQuantity = getQuantityAvailableInInventory(actor, requiredItem.itemType);
        if(availableQuantity < requiredItem.quantity) {
            return null;
        }
    }

    return {
        actionType: ActionType.Craft,
        craftingRecipe: recipe,
    }
}

function tryBuildStructure(actor: Actor, gameState: GameState): ActorAction | null {
    const buildableBlueprints = getBlueprints(gameState).filter(blueprint => getProvidableItems(blueprint, actor).length)

    const nearestBlueprint = getNearestEntity(actor.location, buildableBlueprints);
    if(!nearestBlueprint) return null;

    const distance = actor.location.distanceTo(nearestBlueprint.location);
    if(distance <= nearestBlueprint.size){

        const providableItems = getProvidableItems(nearestBlueprint, actor);
        return {
            actionType: ActionType.InsertItem,
            targetUuid: nearestBlueprint.uuid,
            item: providableItems[0],
            quantity: 1,
        }
    }
    else{
        const direction = nearestBlueprint.location.clone().sub(actor.location).normalize();
        return {
            actionType: ActionType.Move,
            direction: direction,
        };
    }
}

export function tryAddItemToInventory(actor: Actor, item: InventoryItem, quantity: number): boolean {
    const slotWithItem = actor.inventory.find(slot => slot.item?.itemType === item.itemType);
    if(slotWithItem){
        slotWithItem.quantity += quantity;
        return true;
    }

    const emptySlot = actor.inventory.find(slot => slot.item === null);
    if(emptySlot){
        emptySlot.item = item;
        emptySlot.quantity = quantity;
        return true;
    }

    return false;
}

/**
 * Removes as much of the specified item type from the actors inventory as possible, up to the specified quantity.
 * @param actor 
 * @param itemType 
 * @param quantity 
 * @returns The quantity of items that were successfully removed from the inventory.
 */
export function tryGrabItemQuantityFromInventory(actor: Actor, itemType: ItemType, quantity: number): number {
    let remainingQuantityToRemove = quantity;

    for(const slot of actor.inventory) {
        if(slot.item?.itemType === itemType) {
            const quantityToRemove = Math.min(slot.quantity, remainingQuantityToRemove);
            remainingQuantityToRemove -= quantityToRemove;
            slot.quantity -= quantityToRemove;

            if(slot.quantity <= 0) {
                slot.item = null;
            }

            if(remainingQuantityToRemove <= 0){
                break;
            }
        }
    }

    return quantity - remainingQuantityToRemove;
}

export function removeItemQuantityFromInventory(actor: Actor, itemType: ItemType, quantity: number): void {
    const removedQuantity = tryGrabItemQuantityFromInventory(actor, itemType, quantity);
    if(removedQuantity < quantity) {
        throw new Error(`Not enough items in inventory to grab ${quantity}x ${ItemType[itemType]}`);
    }
}

export function getQuantityAvailableInInventory(actor: Actor, itemType: ItemType): number {
    return actor.inventory.reduce((total, slot) => {
        if(slot.item?.itemType === itemType) {
            return total + slot.quantity;
        }
        return total;
    }, 0);
}