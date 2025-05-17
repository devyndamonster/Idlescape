import { EntityType } from "@/enums/EntityType";
import { InventorySlot } from "../InventorySlot";
import { Objective } from "../Objective";
import { RenderableEntity } from "./RenderableEntity";

export interface Actor extends RenderableEntity {
    entityType: EntityType.Actor;
    inventory: InventorySlot[];
    currentObjective: Objective;
    moveSpeed: number;
    harvestProgress: number;
    hunger: number;
    thirst: number;
    health: number;
    maxHealth: number;
}