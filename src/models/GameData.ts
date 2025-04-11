import { BuildableType } from "@/enums/BuildableType";
import { ItemType } from "@/enums/ItemType";
import { ResourceType } from "@/enums/ResourceType";
import { BlueprintData } from "./Blueprint";
import { GameState } from "./GameState";

interface ResourceSetting {
    resourceType: ResourceType;
    initialQuantity: number;
    harvestTime: number;
    size: number;
    icon: string;
    drops: ResourceDrop[];
    initialGenerationMin?: number;
    initialGenerationMax?: number;
}

interface ResourceDrop {
    itemType: ItemType;
    dropChance: number;
    dropAmount: number;
}

const resourceSettings: Record<ResourceType, ResourceSetting> = {
    [ResourceType.Stick]: {
        resourceType: ResourceType.Stick,
        initialQuantity: 5,
        harvestTime: 5,
        size: 40,
        icon: '/Idlescape/Stick.svg',
        drops: [
            { itemType: ItemType.Stick, dropChance: 1, dropAmount: 1 },
        ],
    },
    [ResourceType.Stone]: {
        resourceType: ResourceType.Stone,
        initialQuantity: 50,
        harvestTime: 10,
        size: 80,
        icon: '/Idlescape/Rock.svg',
        drops: [
            { itemType: ItemType.Stone, dropChance: 1, dropAmount: 1 },
        ],
        initialGenerationMin: 10,
        initialGenerationMax: 20,
    },
    [ResourceType.Tree]: {
        resourceType: ResourceType.Tree,
        initialQuantity: 5,
        harvestTime: 30,
        size: 80,
        icon: '/Idlescape/PineTree.svg',
        drops: [
            { itemType: ItemType.Stick, dropChance: 1, dropAmount: 1 },
            { itemType: ItemType.Stick, dropChance: 0.5, dropAmount: 1 },
            { itemType: ItemType.Stick, dropChance: 0.25, dropAmount: 1 },
            { itemType: ItemType.Leaf, dropChance: 1, dropAmount: 3 },
            { itemType: ItemType.TreeSeed, dropChance: 1, dropAmount: 1 },
            { itemType: ItemType.TreeSeed, dropChance: 0.5, dropAmount: 1 },
        ],
        initialGenerationMin: 3,
        initialGenerationMax: 8,
    },
    [ResourceType.Grass]: {
        resourceType: ResourceType.Grass,
        initialQuantity: 10,
        harvestTime: 1,
        size: 40,
        icon: '/Idlescape/Grass.svg',
        drops: [
            { itemType: ItemType.GrassSeed, dropChance: 1, dropAmount: 1 },
            { itemType: ItemType.GrassSeed, dropChance: 0.5, dropAmount: 1 },
            { itemType: ItemType.FreshGrass, dropChance: 1, dropAmount: 1 },
        ],
        initialGenerationMin: 10,
        initialGenerationMax: 20,
    },
    [ResourceType.FallenTree]: {
        resourceType: ResourceType.FallenTree,
        initialQuantity: 1,
        harvestTime: 20,
        size: 80,
        icon: '/Idlescape/Log.svg',
        drops: [
            { itemType: ItemType.Log, dropChance: 1, dropAmount: 3 },
            { itemType: ItemType.Log, dropChance: 0.5, dropAmount: 2 },
            { itemType: ItemType.Log, dropChance: 0.5, dropAmount: 1 },
        ],
        initialGenerationMin: 1,
        initialGenerationMax: 3,
    },
}

const blueprints: Record<BuildableType, BlueprintData> = {
    [BuildableType.Stockpile]: {
        buildableType: BuildableType.Stockpile,
        icon: '/Idlescape/Stockpile.svg',
        size: 100,
        requiredItems: [
            { itemType: ItemType.Stick, quantity: 10 },
            { itemType: ItemType.Stone, quantity: 10 },
        ],
        buildTimePerItem: 20,
        onComplete: (blueprint, gameState) => {
            const updatedGameState: GameState = { 
                ...gameState,
                structures: [
                    ...gameState.structures,
                    {
                        structureType: BuildableType.Stockpile,
                        uuid: blueprint.uuid,
                        size: blueprint.size,
                        icon: blueprint.icon,
                        location: blueprint.location,
                    }
                ],
                blueprints: gameState.blueprints.filter(b => b.uuid !== blueprint.uuid),
             };

            return updatedGameState;
        },
    },
    [BuildableType.TreeSeed]: {
        buildableType: BuildableType.TreeSeed,
        icon: '/Idlescape/Seedling.svg',
        size: 60,
        requiredItems: [
            { itemType: ItemType.TreeSeed, quantity: 1 },
        ],
        buildTimePerItem: 5,
        onComplete: (blueprint, gameState, gameData) => {
            const updatedGameState: GameState = { 
                ...gameState,
                resources: [
                    ...gameState.resources,
                    {
                        resourceType: ResourceType.Tree,
                        uuid: blueprint.uuid,
                        size: blueprint.size,
                        location: blueprint.location,
                        quantityRemaining: gameData.resourceSettings[ResourceType.Tree].initialQuantity,
                        harvestTime: gameData.resourceSettings[ResourceType.Tree].harvestTime,
                    }
                ],
                blueprints: gameState.blueprints.filter(b => b.uuid !== blueprint.uuid),
             };

            return updatedGameState;
        },
    },
    [BuildableType.GrassSeed]: {
        buildableType: BuildableType.GrassSeed,
        icon: '/Idlescape/Seedling.svg',
        size: 60,
        requiredItems: [
            { itemType: ItemType.GrassSeed, quantity: 1 },
        ],
        buildTimePerItem: 5,
        onComplete: (blueprint, gameState, gameData) => {
            const updatedGameState: GameState = { 
                ...gameState,
                resources: [
                    ...gameState.resources,
                    {
                        resourceType: ResourceType.Grass,
                        uuid: blueprint.uuid,
                        size: blueprint.size,
                        location: blueprint.location,
                        quantityRemaining: gameData.resourceSettings[ResourceType.Grass].initialQuantity,
                        harvestTime: gameData.resourceSettings[ResourceType.Grass].harvestTime,
                    }
                ],
                blueprints: gameState.blueprints.filter(b => b.uuid !== blueprint.uuid),
             };

            return updatedGameState;
        },
    }
}

export interface GameData {
    worldWidth: number;
    worldHeight: number;
    resourceSettings: Record<ResourceType, ResourceSetting>;
    blueprintData: Record<BuildableType, BlueprintData>;
    imageCache: Record<string, HTMLImageElement>;
}

export const DefaultGameData: GameData = {
    worldWidth: 2000,
    worldHeight: 2000,
    resourceSettings: resourceSettings,
    blueprintData: blueprints,
    imageCache: {},
}

