import { ActionType } from "@/enums/ActionType";
import { ObjectiveType } from "@/enums/ObjectiveType";
import { Actor } from "@/models/Actor";
import { ActorAction } from "@/models/ActorAction";
import { GameState } from "@/models/GameState";
import { getNearestResource } from "./WorldUtils";
import { ResourceType } from "@/enums/ResourceType";
import { InventoryItem } from "@/models/InventoryItem";
import { Vector2 } from "three";

export function getNewActor(location: Vector2): Actor {
    return {
        location: location,
        moveSpeed: 2,
        size: 20,
        harvestProgress: 0,
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

export function tryAddItemToInventory(actor: Actor, item: InventoryItem): boolean {
    const slotWithItem = actor.inventory.find(slot => slot.item?.name === item.name);
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