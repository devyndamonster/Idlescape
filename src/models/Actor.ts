import { WorldEntity } from "./WorldEntity";
import { InventorySlot } from "./InventorySlot";
import { Objective } from "./Objective";

export interface Actor extends WorldEntity {
    inventory: InventorySlot[];
    currentObjective: Objective;
    moveSpeed: number;
    harvestProgress: number;
}