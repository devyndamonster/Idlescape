import { ActionType } from "@/enums/ActionType";

export type ActorAction = 
    IdleAction |    
    MoveAction | 
    CollectAction;

export type IdleAction = {
    actionType: ActionType.Idle;
}

export type MoveAction = {
    actionType: ActionType.Move;
}

export type CollectAction = {
    actionType: ActionType.Collect;
}