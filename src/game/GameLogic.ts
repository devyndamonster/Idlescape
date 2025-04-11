import { ActionType } from "@/enums/ActionType";
import { ResourceType } from "@/enums/ResourceType";
import { GameData } from "@/models/GameData";
import { GameState } from "@/models/GameState";
import { MathUtils, Vector2 } from "three";
import { getActorAction, getNewActor, tryAddItemToInventory } from "./ActorLogic";
import { InventoryItem } from "@/models/InventoryItem";
import { Blueprint } from "@/models/Blueprint";
import { getRemainingRequiredItems } from "./BlueprintLogic";

export function getUpdatedGameState(gameState: GameState, gameData: GameData, queuedBlueprints: Blueprint[]): GameState {
    
    let updatedGameState: GameState = {
        ...gameState,
        blueprints: [...gameState.blueprints, ...queuedBlueprints],
    };
    
    const deltaTimeSeconds = getDeltaTimeSeconds(updatedGameState.timestamp);

    updatedGameState.timestamp = Date.now();
    updatedGameState.currentTick += 1;

    for(const blueprint of updatedGameState.blueprints){
        if(blueprint.currentBuildTime > 0){
            blueprint.currentBuildTime -= deltaTimeSeconds;
        }
    }
    
    for(const actor of updatedGameState.actors){

        const action = getActorAction(actor, updatedGameState);
        if(action.actionType == ActionType.Collect){

            const targetResource = updatedGameState.resources.find(r => r.uuid === action.targetResource.uuid);
            if(targetResource){
                
                const harvestDelta = deltaTimeSeconds / targetResource.harvestTime;
                actor.harvestProgress += harvestDelta;

                if(actor.harvestProgress >= 1)
                {
                    actor.harvestProgress = 0;
                    
                    const harvestedItems = getDroppedItemsFromResource(targetResource.resourceType, gameData);
                    for (const item of harvestedItems) {
                        tryAddItemToInventory(actor, item);
                    }
                    
                    targetResource.quantityRemaining -= 1;
                    if(targetResource.quantityRemaining <= 0){
                        updatedGameState.resources = updatedGameState.resources.filter(r => r.uuid !== targetResource.uuid);
                    }
                }
            }
        }
        else if(action.actionType == ActionType.Move){
            actor.location.add(action.direction.clone().multiplyScalar(actor.moveSpeed));
        }
        else if(action.actionType == ActionType.InsertItem){
            const targetBlueprint = updatedGameState.blueprints.find(b => b.uuid === action.targetUuid);
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

    const chanceOfResourceSpawn = 0.01;
    if(Math.random() < chanceOfResourceSpawn){
        const resourceData = gameData.resourceSettings[ResourceType.Stick];
        updatedGameState.resources.push({
            uuid: crypto.randomUUID(),
            location: new Vector2(Math.random() * 1000, Math.random() * 1000),
            quantityRemaining: resourceData.initialQuantity,
            size: resourceData.size,
            harvestTime: resourceData.harvestTime,
            resourceType: resourceData.resourceType,
        });
    }

    return updatedGameState;
}

export function generateInitialGameState(gameData: GameData): GameState {
    let initialGameState: GameState = {
        currentTick: 0,
        timestamp: Date.now(),
        actors: [],
        resources: [],
        structures: [],
        blueprints: [],
    }

    const resourceTypes = Object.values(ResourceType).filter(
        (value) => typeof value === "number"
    );

    for(const resourceType of resourceTypes){
        generateResource(resourceType, gameData, initialGameState);
    }

    const initialActor = getNewActor(new Vector2(500, 500));
    initialGameState.actors.push(initialActor);

    console.log(initialGameState);
    
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

            const isLocationValid = gameState.resources.every(resource => resource.location.distanceTo(location) > resource.size);
            if(isLocationValid){
                gameState.resources.push({
                    uuid: crypto.randomUUID(),
                    location: location,
                    quantityRemaining: gameData.resourceSettings[resourceType].initialQuantity,
                    size: gameData.resourceSettings[resourceType].size,
                    harvestTime: gameData.resourceSettings[resourceType].harvestTime,
                    resourceType: resourceType,
                });
                break;
            }
        }
    }
}


function getDeltaTimeSeconds(previousTime: number){
    return (Date.now() - previousTime) / 1000;
}