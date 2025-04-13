import { BuildableType } from "@/enums/BuildableType";
import { RenderableEntity } from "./RenderableEntity";
import { EntityType } from "@/enums/EntityType";

export interface Structure extends RenderableEntity {
    entityType: EntityType.Structure;
    structureType: BuildableType;
}