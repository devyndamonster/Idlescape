import { EntityType } from "@/enums/EntityType";
import { Vector2 } from "three";

export interface WorldEntity {
    entityType: EntityType;
    uuid: string;
    location: Vector2;
    size: number;
}