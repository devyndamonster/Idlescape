import { ItemType } from "@/enums/ItemType";
import { Objective } from "./Objective";

export interface ActorStrategy
{
    /** Any of the conditions can be true to trigger the strategy */
    conditions: StrategyCondition[];
    objective: Objective;
}

/** All provided conditions must be true to trigger the condition */
export interface StrategyCondition
{
    hungerLessThan?: number;
    thirstLessThan?: number;
    itemQuantityLessThan?: {
        itemType: ItemType;
        quantity: number;
    }
}