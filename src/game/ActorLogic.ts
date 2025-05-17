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

export function getNewActor(location: Vector2): Actor {
    return {
        entityType: EntityType.Actor,
        location: location,
        moveSpeed: 20,
        size: 80,
        icon: "/Idlescape/StickCharacter.svg",
        harvestProgress: 0,
        hunger: 1,
        thirst: 1,
        health: 100,
        maxHealth: 100,
        uuid: crypto.randomUUID(),
        inventory: [...Array(10)].map(_ => ({ item: null, quantity: 0 })),
        currentObjective: {
            objectiveType: ObjectiveType.CollectResource,
            resourceType: ResourceType.Stick,
        }
    }
}

export function getActorAction(actor: Actor, gameState: GameState): ActorAction {
    
    let action: ActorAction = {
        actionType: ActionType.Idle,
    }

    if(actor.currentObjective.objectiveType == ObjectiveType.CollectResource){
        action = tryCollectResource(actor, actor.currentObjective.resourceType, gameState) ?? action;
    }
    else if(actor.currentObjective.objectiveType == ObjectiveType.BuildStructure){
        action = tryBuildStructure(actor, gameState) ?? action;
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
        }
    }
    else{
        const direction = nearestResource.location.clone().sub(actor.location).normalize();
        return {
            actionType: ActionType.Move,
            direction: direction,
        };
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

export function tryAddItemToInventory(actor: Actor, item: InventoryItem): boolean {
    const slotWithItem = actor.inventory.find(slot => slot.item?.itemType === item.itemType);
    if(slotWithItem){
        slotWithItem.quantity += 1;
        return true;
    }

    const emptySlot = actor.inventory.find(slot => slot.item === null);
    if(emptySlot){
        emptySlot.item = item;
        emptySlot.quantity = 1;
        return true;
    }

    return false;
}

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