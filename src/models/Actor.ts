import { Objective } from "../enums/Objective";
import { InventoryItem } from "./InventoryItem";
import { WorldEntity } from "./WorldEntity";

export interface Actor extends WorldEntity {
    inventory: InventoryItem[];
    currentObjective: Objective;
}