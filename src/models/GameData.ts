import { BuildableType } from "@/enums/BuildableType";
import { ItemType } from "@/enums/ItemType";
import { ResourceType } from "@/enums/ResourceType";
import { BlueprintData } from "./entities/Blueprint";
import { GameState } from "./GameState";
import { EntityType } from "@/enums/EntityType";
import { TerrainType } from "./MapTile";
import { Resource } from "./entities/Resource";
import { Actor } from "./entities/Actor";
import { ActorInteaction, ActorInteractionType } from "@/enums/ActorInteractionType";
import { getDroppedItemsFromResource } from "@/game/GameLogic";
import { removeItemQuantityFromInventory, tryAddItemToInventory } from "@/game/ActorLogic";
import { CraftingRecipe } from "./CraftingRecipe";
import { match } from 'ts-pattern';

export type Modify<T, R extends Partial<Record<keyof T, any>>> = Omit<T, keyof R> & R;

export type ResourceInteraction = Modify<ActorInteaction, {targetEntity: Resource}>;

interface ResourceSetting {
    resourceType: ResourceType;
    initialQuantity: number;
    harvestTime: number;
    size: number;
    icon: string;
    drops: ResourceDrop[];
    onInteract: (actorInteraction: ResourceInteraction, gameState: GameState, gameData: GameData, currentTime: number) => void;
    initialGenerationMin?: number;
    initialGenerationMax?: number;
    destroyOnDepleted: boolean;
    regrowthTimeSeconds: number | null;
    growthTileTypes: TerrainType[];
}

interface ResourceDrop {
    itemType: ItemType;
    dropChance: number;
    dropAmount: number;
}

const harvestResource = (targetResource: Resource, actor: Actor, gameState: GameState, gameData: GameData, currentTime: number) => {
    const resourceData = gameData.resourceSettings[targetResource.resourceType];
    const harvestedItems = getDroppedItemsFromResource(targetResource.resourceType, gameData);
    for (const item of harvestedItems) {
        tryAddItemToInventory(actor, item, 1);
    }

    targetResource.quantityRemaining -= 1;
    targetResource.timeLastHarvested = currentTime;
    if(targetResource.quantityRemaining <= 0 && resourceData.destroyOnDepleted){
        gameState.entities = gameState.entities.filter(r => r.uuid !== targetResource.uuid);
    }
}

const drinkResource = (targetResource: Resource, actor: Actor, gameState: GameState, gameData: GameData, currentTime: number) => {
    const resourceData = gameData.resourceSettings[targetResource.resourceType];

    actor.thirst = 1;

    targetResource.quantityRemaining -= 1;
    targetResource.timeLastHarvested = currentTime;
    if(targetResource.quantityRemaining <= 0 && resourceData.destroyOnDepleted){
        gameState.entities = gameState.entities.filter(r => r.uuid !== targetResource.uuid);
    }
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
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
        growthTileTypes: [TerrainType.Soil, TerrainType.Sand],
        initialGenerationMin: 10,
        initialGenerationMax: 20,
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
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
        growthTileTypes: [TerrainType.Rock, TerrainType.Soil],
        initialGenerationMin: 15,
        initialGenerationMax: 25,
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
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
        growthTileTypes: [TerrainType.Soil],
        initialGenerationMin: 10,
        initialGenerationMax: 15,
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
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: true,
        regrowthTimeSeconds: 60,
        growthTileTypes: [TerrainType.Soil],
        initialGenerationMin: 25,
        initialGenerationMax: 35,
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
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
        growthTileTypes: [TerrainType.Soil, TerrainType.Sand],
        initialGenerationMin: 5,
        initialGenerationMax: 10,
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
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: false,
        regrowthTimeSeconds: 30,
        growthTileTypes: [TerrainType.Soil],
        initialGenerationMin: 6,
        initialGenerationMax: 12,
    },
    [ResourceType.WaterSpring]: {
        resourceType: ResourceType.WaterSpring,
        initialQuantity: 100,
        harvestTime: 1,
        size: 60,
        icon: '/Idlescape/WaterSpring.svg',
        drops: [],
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                match(actorInteraction)
                    .with({itemsProvided: [ItemType.ClayCup]}, () => {
                        removeItemQuantityFromInventory(actorInteraction.actor, ItemType.ClayCup, 1);
                        tryAddItemToInventory(actorInteraction.actor, { itemType: ItemType.FullClayCup }, 1);
                    })
                    .otherwise(() => {
                        drinkResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
                    })
            }
        },
        destroyOnDepleted: false,
        regrowthTimeSeconds: 1,
        growthTileTypes: [TerrainType.Rock],
        initialGenerationMin: 1,
        initialGenerationMax: 1,
    },
    [ResourceType.Clay]: {
        resourceType: ResourceType.Clay,
        initialQuantity: 20,
        harvestTime: 10,
        size: 60,
        icon: '/Idlescape/Clay.svg',
        drops: [
            { itemType: ItemType.Clay, dropChance: 1, dropAmount: 1 },
        ],
        onInteract: (actorInteraction: ResourceInteraction, gameState, gameData, currentTime) => {
            if(actorInteraction.type == ActorInteractionType.Harvest){
                harvestResource(actorInteraction.targetEntity, actorInteraction.actor, gameState, gameData, currentTime);
            }
        },
        destroyOnDepleted: true,
        regrowthTimeSeconds: null,
        growthTileTypes: [TerrainType.Sand],
        initialGenerationMin: 5,
        initialGenerationMax: 10,
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

const craftingRecipes: CraftingRecipe[] = [
    {
        recipeId: 1,
        resultItemType: ItemType.ClayCup,
        resultQuantity: 1,
        craftingTimeSeconds: 10,
        requiredItems: [
            { itemType: ItemType.Clay, quantity: 1 },
        ]
    }
]

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
    craftingRecipes: CraftingRecipe[];
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
    craftingRecipes: craftingRecipes,
}

