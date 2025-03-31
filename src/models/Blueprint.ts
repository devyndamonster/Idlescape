import { BuildableType } from "@/enums/BuildableType";
import { GameData } from "./GameData";
import { GameState } from "./GameState";
import { WorldEntity } from "./WorldEntity";
import { ItemType } from "@/enums/ItemType";

export interface BlueprintData {
    buildableType: BuildableType;
    icon: string;
    size: number;
    requiredItems: { itemType: ItemType; quantity: number }[];
    onComplete: (blueprint: Blueprint, gameState: GameState, gameData: GameData) => GameState;
}

export interface Blueprint extends WorldEntity, BlueprintData {
    currentItems: { itemType: ItemType; quantity: number }[];
}