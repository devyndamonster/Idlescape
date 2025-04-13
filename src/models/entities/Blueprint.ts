import { BuildableType } from "@/enums/BuildableType";
import { GameData } from "../GameData";
import { GameState } from "../GameState";
import { ItemType } from "@/enums/ItemType";
import { RenderableEntity } from "./RenderableEntity";
import { EntityType } from "@/enums/EntityType";

export interface BlueprintData {
    buildableType: BuildableType;
    icon: string;
    size: number;
    requiredItems: { itemType: ItemType; quantity: number }[];
    buildTimePerItem: number;
    onComplete: (blueprint: Blueprint, gameState: GameState, gameData: GameData) => GameState;
}

export interface Blueprint extends RenderableEntity, BlueprintData {
    entityType: EntityType.Blueprint;
    currentItems: { itemType: ItemType; quantity: number }[];
    currentBuildTime: number;
}