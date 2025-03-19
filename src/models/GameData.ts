import { ResourceType } from "@/enums/ResourceType";

interface ResourceSetting {
    resourceType: ResourceType;
    initialQuantity: number;
    harvestTime: number;
    size: number;
}

export interface GameData {
    resourceSettings: Record<ResourceType, ResourceSetting>;
}

export const DefaultGameData: GameData = {
    resourceSettings: {
        [ResourceType.Stick]: {
            resourceType: ResourceType.Stick,
            initialQuantity: 5,
            harvestTime: 5,
            size: 20,
        },
        [ResourceType.Stone]: {
            resourceType: ResourceType.Stone,
            initialQuantity: 10,
            harvestTime: 10,
            size: 20,
        },
    }
}