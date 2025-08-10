import { EntityType } from "@/enums/EntityType";
import { InventorySlot } from "../InventorySlot";
import { RenderableEntity } from "./RenderableEntity";
import { Edge, ReactFlowJsonObject } from "@xyflow/react";
import { AppNode } from "@/state/types";

export interface Actor extends RenderableEntity {
    entityType: EntityType.Actor;
    inventory: InventorySlot[];
    strategy: ReactFlowJsonObject<AppNode, Edge> | undefined;
    moveSpeed: number;
    harvestProgress: number;
    hunger: number;
    thirst: number;
    health: number;
    maxHealth: number;
}