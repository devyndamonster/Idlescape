import { ResourceType } from "@/enums/ResourceType";
import { WorldEntity } from "./WorldEntity";

export interface Resource extends WorldEntity {
    resourceType: ResourceType;
    quantityRemaining: number;
    harvestTime: number;
}