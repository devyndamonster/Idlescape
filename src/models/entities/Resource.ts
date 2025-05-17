import { ResourceType } from "@/enums/ResourceType";
import { RenderableEntity } from "./RenderableEntity";
import { EntityType } from "@/enums/EntityType";

export interface Resource extends RenderableEntity {
    entityType: EntityType.Resource;
    resourceType: ResourceType;
    quantityRemaining: number;
    harvestTime: number;
    timeLastHarvested?: number;
    timeLastRegrowth?: number;
}