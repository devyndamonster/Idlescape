import { ItemType } from "@/enums/ItemType";
import { ResourceType } from "@/enums/ResourceType";

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

export interface GameData {
    worldWidth: number;
    worldHeight: number;
    resourceSettings: Record<ResourceType, ResourceSetting>;
}

export const DefaultGameData: GameData = {
    worldWidth: 1000,
    worldHeight: 1000,
    resourceSettings: {
        [ResourceType.Stick]: {
            resourceType: ResourceType.Stick,
            initialQuantity: 5,
            harvestTime: 5,
            size: 20,
            icon: '🪵',
            drops: [
                { itemType: ItemType.Stick, dropChance: 1, dropAmount: 1 },
            ],
        },
        [ResourceType.Stone]: {
            resourceType: ResourceType.Stone,
            initialQuantity: 50,
            harvestTime: 10,
            size: 20,
            icon: '🪨',
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
            size: 40,
            icon: '🌲',
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
            size: 20,
            icon: '🌿',
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
            size: 40,
            icon: '🪵',
            drops: [
                { itemType: ItemType.Log, dropChance: 1, dropAmount: 3 },
                { itemType: ItemType.Log, dropChance: 0.5, dropAmount: 2 },
                { itemType: ItemType.Log, dropChance: 0.5, dropAmount: 1 },
            ],
            initialGenerationMin: 1,
            initialGenerationMax: 3,
        },
    }
}

interface ResourceDrop {
    itemType: ItemType;
    dropChance: number;
    dropAmount: number;
}