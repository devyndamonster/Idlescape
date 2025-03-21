import { BuildableType } from "@/enums/BuildableType";
import { WorldEntity } from "./WorldEntity";

export interface Structure extends WorldEntity {
    structureType: BuildableType;
}