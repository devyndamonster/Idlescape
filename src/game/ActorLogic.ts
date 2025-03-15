import { ActionType } from "@/enums/ActionType";
import { Objective } from "@/enums/Objective";
import { Actor } from "@/models/Actor";
import { ActorAction } from "@/models/ActorAction";
import { GameState } from "@/models/GameState";

export function getActorAction(actor: Actor, gameState: GameState): ActorAction {
    
    let action: ActorAction = {
        actionType: ActionType.Idle,
    }

    if(actor.currentObjective == Objective.CollectSticks){
        action = {
            actionType: ActionType.Collect,
        }
    }

    return action;
}