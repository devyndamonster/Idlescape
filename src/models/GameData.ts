import { BuildableType } from "@/enums/BuildableType";
import { ItemType } from "@/enums/ItemType";
import { ResourceType } from "@/enums/ResourceType";
import { BlueprintData } from "./entities/Blueprint";
import { GameState } from "./GameState";
import { EntityType } from "@/enums/EntityType";

interface ResourceSetting {
    resourceType: ResourceType;
    initialQuantity: number;
    harvestTime: number;
    size: number;
    icon: string;
    drops: ResourceDrop[];
    initialGenerationMin?: number;
    initialGenerationMax?: number;
    destroyOnDepleted: boolean;
    regrowthTimeSeconds: number | null;
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
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
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
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
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
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
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
        destroyOnDepleted: true,
        regrowthTimeSeconds: 60,
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
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
    },
    [ResourceType.BlueberryBush]: {
        resourceType: ResourceType.BlueberryBush,
        initialQuantity: 25,
        harvestTime: 5,
        size: 60,
        icon: '/Idlescape/BlueberryBush.svg',
        drops: [
            { itemType: ItemType.Blueberry, dropChance: 1, dropAmount: 1 },
        ],
        initialGenerationMin: 3,
        initialGenerationMax: 6,
        destroyOnDepleted: false,
        regrowthTimeSeconds: 30,
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
                entities: [
                    ...gameState.entities.filter(e => e.uuid !== blueprint.uuid),
                    {
                        entityType: EntityType.Structure,
                        structureType: BuildableType.Stockpile,
                        uuid: blueprint.uuid,
                        size: blueprint.size,
                        icon: blueprint.icon,
                        location: blueprint.location,
                    }
                ],
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
            const resourceData = gameData.resourceSettings[ResourceType.Tree];
            const updatedGameState: GameState = { 
                ...gameState,
                entities: [
                    ...gameState.entities.filter(b => b.uuid !== blueprint.uuid),
                    {
                        entityType: EntityType.Resource,
                        uuid: blueprint.uuid,
                        location: blueprint.location,
                        icon: resourceData.icon,
                        resourceType: resourceData.resourceType,
                        size: resourceData.size,
                        quantityRemaining: resourceData.initialQuantity,
                        harvestTime: resourceData.harvestTime,
                    }
                ],
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
            const resourceData = gameData.resourceSettings[ResourceType.Grass];
            const updatedGameState: GameState = { 
                ...gameState,
                entities: [
                    ...gameState.entities.filter(b => b.uuid !== blueprint.uuid),
                    {
                        entityType: EntityType.Resource,
                        uuid: blueprint.uuid,
                        location: blueprint.location,
                        icon: resourceData.icon,
                        resourceType: resourceData.resourceType,
                        size: resourceData.size,
                        quantityRemaining: resourceData.initialQuantity,
                        harvestTime: resourceData.harvestTime,
                    }
                ],
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
    hungerDecreasePerSecond: number;
    thirstDecreasePerSecond: number;
    hungerDamagePerSecond: number;
    thirstDamagePerSecond: number;
    healthRegenerationPerSecond: number;
}

export const DefaultGameData: GameData = {
    worldWidth: 2000,
    worldHeight: 2000,
    resourceSettings: resourceSettings,
    blueprintData: blueprints,
    imageCache: {},
    hungerDecreasePerSecond: 0.01,
    thirstDecreasePerSecond: 0.01,
    hungerDamagePerSecond: 0.1,
    thirstDamagePerSecond: 0.1,
    healthRegenerationPerSecond: 0.1,
}

