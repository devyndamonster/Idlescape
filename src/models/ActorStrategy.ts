import { ItemType } from "@/enums/ItemType";
import { Objective } from "./Objective";

export interface ActorStrategy
{
    /** All of the conditions must be true for strategy to apply */
    conditions: StrategyCondition[];
    objective: Objective;
}

export type StrategyCondition = HunderCondition | ThirstCondition | ItemQuantityCondition;

export interface HunderCondition{
    conditionType: StrategyConditionType.HungerLessThan;
    hungerLessThan: number;
}

export interface ThirstCondition{
    conditionType: StrategyConditionType.ThirstLessThan;
    thirstLessThan: number;
}

export interface ItemQuantityCondition{
    conditionType: StrategyConditionType.ItemQuantityLessThan;
    itemType: ItemType;
    quantity: number;
}

export enum StrategyConditionType
{
    HungerLessThan = 1,
    ThirstLessThan = 2,
    ItemQuantityLessThan = 3
}