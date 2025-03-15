import { ActionType } from "@/enums/ActionType";
import { Objective } from "@/enums/Objective";
import { Actor } from "@/models/Actor";
import { ActorAction } from "@/models/ActorAction";
import { GameState } from "@/models/GameState";
import { getNearestResource } from "./WorldUtils";
import { ResourceType } from "@/enums/ResourceType";

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
    if(distance <= nearestResource.collectionRadius){
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