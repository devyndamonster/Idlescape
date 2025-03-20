import { Objective } from "../enums/Objective";
import { WorldEntity } from "./WorldEntity";
import { InventorySlot } from "./InventorySlot";

export interface Actor extends WorldEntity {
    inventory: InventorySlot[];
    currentObjective: Objective;
    moveSpeed: number;
    harvestProgress: number;
}