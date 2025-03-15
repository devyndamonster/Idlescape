import { ActionType } from "@/enums/ActionType";
import { Resource } from "./Resource";
import { Vector2 } from "three";

export type ActorAction = 
    IdleAction |    
    MoveAction | 
    CollectAction;

export type IdleAction = {
    actionType: ActionType.Idle;
}

export type MoveAction = {
    actionType: ActionType.Move;
    direction: Vector2;
}

export type CollectAction = {
    actionType: ActionType.Collect;
    targetResource: Resource;
}