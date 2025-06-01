import { ActionType } from "@/enums/ActionType";
import { ResourceType } from "@/enums/ResourceType";
import { GameData } from "@/models/GameData";
import { GameState, getActors, getBlueprints, getResources } from "@/models/GameState";
import { MathUtils, Vector2 } from "three";
import { getActorAction, getNewActor, tryAddItemToInventory, tryGrabItemQuantityFromInventory } from "./ActorLogic";
import { InventoryItem } from "@/models/InventoryItem";
import { getRemainingRequiredItems } from "./BlueprintLogic";
import { GameUpdate, GameUpdateType } from "./GameContext";
import { EntityType } from "@/enums/EntityType";
import { ItemType } from "@/enums/ItemType";
import { AppState } from "@/models/AppState";
import { MapTile } from "@/models/MapTile";
import { generateMapTiles } from "./WorldGenerationLogic";

function applyGameUpdate(gameState: GameState, gameData: GameData, gameUpdate: GameUpdate){
    if(gameUpdate.updateType == GameUpdateType.BuildAction){
        const blueprintData = gameData.blueprintData[gameUpdate.buildableType];
        gameState.entities.push({
            ...blueprintData,
            entityType: EntityType.Blueprint,
            uuid: crypto.randomUUID(),
            location: gameUpdate.location,
            currentItems: [],
            currentBuildTime: 0,
        });
    }
    else if(gameUpdate.updateType == GameUpdateType.UpdateActor){
        gameState.entities = gameState.entities.map(entity => entity.uuid === gameUpdate.actorUuid ? gameUpdate.updatedActor : entity);
    }
}

export function getUpdatedGameState(gameState: GameState, gameData: GameData, currentTime: number, queuedUpdates: GameUpdate[]): GameState {
    
    let updatedGameState: GameState = {
        ...gameState
    };

    for(const gameUpdate of queuedUpdates){
        applyGameUpdate(updatedGameState, gameData, gameUpdate);
    }
    
    const deltaTimeSeconds = getDeltaTimeSeconds(updatedGameState.timestamp, currentTime);

    updatedGameState.timestamp = currentTime;
    updatedGameState.currentTick += 1;

    const blueprints = getBlueprints(updatedGameState);
    for(const blueprint of blueprints){
        if(blueprint.currentBuildTime > 0){
            blueprint.currentBuildTime -= deltaTimeSeconds;
        }
    }
    
    const actors = getActors(updatedGameState);
    const resources = getResources(updatedGameState);
    for(const actor of actors){

        actor.hunger -= gameData.hungerDecreasePerSecond * deltaTimeSeconds;
        actor.thirst -= gameData.thirstDecreasePerSecond * deltaTimeSeconds;

        if(actor.hunger <= 0 || actor.thirst <= 0){
            const quantityFood = tryGrabItemQuantityFromInventory(actor, ItemType.Blueberry, 1);
            if(quantityFood > 0){
                actor.hunger += 0.5;
                actor.thirst += 0.5;
            }
        }

        if(actor.hunger <= 0){
            actor.hunger = 0;
            actor.health -= gameData.hungerDamagePerSecond * deltaTimeSeconds;
        }

        if(actor.thirst <= 0){
            actor.thirst = 0;
            actor.health -= gameData.thirstDamagePerSecond * deltaTimeSeconds;
        }

        if(actor.hunger > 0 && actor.thirst > 0){
            actor.health += gameData.healthRegenerationPerSecond * deltaTimeSeconds;
            if(actor.health > actor.maxHealth){
                actor.health = actor.maxHealth;
            }
        }

        const action = getActorAction(actor, updatedGameState);
        if(action.actionType == ActionType.Collect){

            const targetResource = resources.find(r => r.uuid === action.targetResource.uuid);

            if(targetResource && targetResource.quantityRemaining > 0)
            {
                const harvestDelta = deltaTimeSeconds / targetResource.harvestTime;
                actor.harvestProgress += harvestDelta;

                if(actor.harvestProgress >= 1)
                {
                    actor.harvestProgress = 0;
                    
                    const harvestedItems = getDroppedItemsFromResource(targetResource.resourceType, gameData);
                    for (const item of harvestedItems) {
                        tryAddItemToInventory(actor, item);
                    }

                    const resourceData = gameData.resourceSettings[targetResource.resourceType];
                    targetResource.quantityRemaining -= 1;
                    targetResource.timeLastHarvested = currentTime;
                    if(targetResource.quantityRemaining <= 0 && resourceData.destroyOnDepleted){
                        updatedGameState.entities = updatedGameState.entities.filter(r => r.uuid !== targetResource.uuid);
                    }
                }
            }
        }
        else if(action.actionType == ActionType.Move){
            if(action.direction != undefined)
            {
                actor.location.add(action.direction.clone().multiplyScalar(actor.moveSpeed * deltaTimeSeconds));
            }
            else{
                const direction = action.destination.clone().sub(actor.location).normalize();
                const distance = actor.location.distanceTo(action.destination);
                const maxMoveDistance = actor.moveSpeed * deltaTimeSeconds;
                const movedDistance = Math.min(distance, maxMoveDistance);

                actor.location.add(direction.clone().multiplyScalar(movedDistance));
            }
        }
        else if(action.actionType == ActionType.InsertItem){
            const targetBlueprint = blueprints.find(b => b.uuid === action.targetUuid);
            const inventoryItem = actor.inventory.find(i => i.item?.itemType === action.item.itemType);

            if(targetBlueprint && inventoryItem){
                if(targetBlueprint.currentBuildTime > 0){
                    targetBlueprint.currentBuildTime -= deltaTimeSeconds;
                }
                else{
                    inventoryItem.quantity -= 1;

                    const currentItem = targetBlueprint.currentItems.find(i => i.itemType === action.item.itemType);
                    if(currentItem){
                        currentItem.quantity += 1;
                    }
                    else{
                        targetBlueprint.currentItems.push({
                            itemType: action.item.itemType,
                            quantity: 1,
                        });
                    }

                    const remainingRequiredItems = getRemainingRequiredItems(targetBlueprint);
                    if(remainingRequiredItems.length){
                        targetBlueprint.currentBuildTime = targetBlueprint.buildTimePerItem;
                    }
                    else{
                        updatedGameState = targetBlueprint.onComplete(targetBlueprint, updatedGameState, gameData);
                    }
                }
            }
        }
    }

    for(const resource of resources){
        const resourceData = gameData.resourceSettings[resource.resourceType];

        //Attempt to regrow
        if(resourceData.regrowthTimeSeconds && resource.quantityRemaining < resourceData.initialQuantity){
            const timeGrowthStarted = Math.max(resource.timeLastHarvested ?? 0, resource.timeLastRegrowth ?? 0);
            const timeSinceLastGrowthSeconds = (currentTime - timeGrowthStarted) / 1000;

            const numberOfGrowthCycles = Math.floor(timeSinceLastGrowthSeconds / resourceData.regrowthTimeSeconds);
            const timeOfLastGrowth = timeGrowthStarted + ((numberOfGrowthCycles * resourceData.regrowthTimeSeconds) * 1000);

            resource.timeLastRegrowth = timeOfLastGrowth;
            resource.quantityRemaining += numberOfGrowthCycles;
            if(resource.quantityRemaining > resourceData.initialQuantity){
                resource.quantityRemaining = resourceData.initialQuantity;
            }
        }
    }

    const chanceOfResourceSpawn = 0.01;
    if(Math.random() < chanceOfResourceSpawn){
        const resourceData = gameData.resourceSettings[ResourceType.Stick];
        updatedGameState.entities.push({
            entityType: EntityType.Resource,
            uuid: crypto.randomUUID(),
            location: new Vector2(Math.random() * 1000, Math.random() * 1000),
            icon: resourceData.icon,
            quantityRemaining: resourceData.initialQuantity,
            size: resourceData.size,
            harvestTime: resourceData.harvestTime,
            resourceType: resourceData.resourceType,
        });
    }

    return updatedGameState;
}

export function generateInitialGameState(gameData: GameData): GameState {

    const mapTiles: MapTile[][] = generateMapTiles(100, 100, 10)

    let initialGameState: GameState = {
        currentTick: 0,
        timestamp: Date.now(),
        entities: [],
        tileGrid: mapTiles,
    }

    const resourceTypes = Object.values(ResourceType).filter(
        (value) => typeof value === "number"
    );

    for(const resourceType of resourceTypes){
        generateResource(resourceType, gameData, initialGameState);
    }

    const initialActor = getNewActor(new Vector2(500, 500));
    initialGameState.entities.push(initialActor);

    return initialGameState;
}

export function getDroppedItemsFromResource(resourceType: ResourceType, gameData: GameData): InventoryItem[] {
    const resource = gameData.resourceSettings[resourceType];
    const droppedItems: InventoryItem[] = [];
    for(const drop of resource.drops) {
        if(Math.random() < drop.dropChance) {
            for(let i = 0; i < drop.dropAmount; i++) {
                droppedItems.push({
                    itemType: drop.itemType,
                });
            }
        }
    }
    return droppedItems;
}

export function loadSVGImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

export function getIsFastForwarding(gameState: GameState | undefined, appState: AppState): boolean {
    return gameState != undefined && !appState.isPaused && (Date.now() - gameState.timestamp) / 1000 > appState.requiredSecondsToFastForward
}

function generateResource(resourceType: ResourceType, gameData: GameData, gameState: GameState){
    const resourceData = gameData.resourceSettings[resourceType];
    if(resourceData.initialGenerationMin === undefined || resourceData.initialGenerationMax === undefined){
        return;
    }

    const targetGenerationCount = MathUtils.randFloat(resourceData.initialGenerationMin, resourceData.initialGenerationMax);
    for(let i = 0; i < targetGenerationCount; i++){
        for(let attempt = 0; attempt < 100; attempt++){
            const locationX = MathUtils.randFloat(0, gameData.worldWidth);
            const locationY = MathUtils.randFloat(0, gameData.worldHeight);
            const location = new Vector2(locationX, locationY);

            const isLocationValid = getResources(gameState).every(resource => resource.location.distanceTo(location) > resource.size);
            if(isLocationValid){
                const resourceData = gameData.resourceSettings[resourceType];
                gameState.entities.push({
                    entityType: EntityType.Resource,
                    uuid: crypto.randomUUID(),
                    location: location,
                    icon: resourceData.icon,
                    quantityRemaining: resourceData.initialQuantity,
                    size: resourceData.size,
                    harvestTime: resourceData.harvestTime,
                    resourceType: resourceData.resourceType,
                });
                break;
            }
        }
    }
}


function getDeltaTimeSeconds(previousTime: number, currentTime: number){
    return (currentTime - previousTime) / 1000;
}