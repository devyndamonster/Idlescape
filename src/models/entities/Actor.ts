import { EntityType } from "@/enums/EntityType";
import { InventorySlot } from "../InventorySlot";
import { RenderableEntity } from "./RenderableEntity";
import { ActorStrategy } from "../ActorStrategy";

export interface Actor extends RenderableEntity {
    entityType: EntityType.Actor;
    inventory: InventorySlot[];
    strategies: ActorStrategy[];
    moveSpeed: number;
    harvestProgress: number;
    hunger: number;
    thirst: number;
    health: number;
    maxHealth: number;
}