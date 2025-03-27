import { ResourceType } from "@/enums/ResourceType";

interface ResourceSetting {
    resourceType: ResourceType;
    initialQuantity: number;
    harvestTime: number;
    size: number;
    icon: string;
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
        },
        [ResourceType.Stone]: {
            resourceType: ResourceType.Stone,
            initialQuantity: 50,
            harvestTime: 10,
            size: 20,
            icon: '🪨',
            initialGenerationMin: 10,
            initialGenerationMax: 20,
        },
        [ResourceType.Tree]: {
            resourceType: ResourceType.Tree,
            initialQuantity: 1,
            harvestTime: 30,
            size: 40,
            icon: '🌲',
            initialGenerationMin: 1,
            initialGenerationMax: 5,
        },
        [ResourceType.Grass]: {
            resourceType: ResourceType.Grass,
            initialQuantity: 10,
            harvestTime: 1,
            size: 20,
            icon: '🌿',
            initialGenerationMin: 10,
            initialGenerationMax: 20,
        },
    }
}