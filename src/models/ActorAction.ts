import { ActionType } from "@/enums/ActionType";
import { Resource } from "./entities/Resource";
import { Vector2 } from "three";
import { InventoryItem } from "./InventoryItem";

export type ActorAction = 
    IdleAction |    
    MoveAction | 
    CollectAction |
    InsertItemAction;

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

export type InsertItemAction = {
    actionType: ActionType.InsertItem;
    targetUuid: string;
    item: InventoryItem;
    quantity: number;
}