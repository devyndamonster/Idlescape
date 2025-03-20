import { ActionType } from "@/enums/ActionType";
import { Objective } from "@/enums/Objective";
import { Actor } from "@/models/Actor";
import { ActorAction } from "@/models/ActorAction";
import { GameState } from "@/models/GameState";
import { getNearestResource } from "./WorldUtils";
import { ResourceType } from "@/enums/ResourceType";
import { InventoryItem } from "@/models/InventoryItem";

export function getActorAction(actor: Actor, gameState: GameState): ActorAction {
    
    let action: ActorAction = {
        actionType: ActionType.Idle,
    }

    if(actor.currentObjective == Objective.CollectSticks){
        action = tryCollectSticks(actor, gameState) ?? action;
    }

    return action;
}

function tryCollectSticks(actor: Actor, gameState: GameState): ActorAction | null {
    const nearestResource = getNearestResource(actor.location, ResourceType.Stick, gameState);
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