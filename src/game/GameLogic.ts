import { ActionType } from "@/enums/ActionType";
import { ResourceType } from "@/enums/ResourceType";
import { GameData } from "@/models/GameData";
import { GameState } from "@/models/GameState";
import { MathUtils, Vector2 } from "three";
import { getActorAction, getNewActor, tryAddItemToInventory } from "./ActorLogic";
import { InventoryItem } from "@/models/InventoryItem";
import { Structure } from "@/models/Structure";
import { Objective } from "@/enums/Objective";

export function getUpdatedGameState(gameState: GameState, gameData: GameData, queuedStructures: Structure[]): GameState {
    
    const updatedGameState: GameState = {
        ...gameState,
        structures: [...gameState.structures, ...queuedStructures],
    };
    
    const deltaTimeSeconds = getDeltaTimeSeconds(updatedGameState.timestamp);

    updatedGameState.timestamp = Date.now();
    updatedGameState.currentTick += 1;
    
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
                    
                    const inventoryItem: InventoryItem = {
                        name:  ResourceType[targetResource.resourceType],
                    };

                    tryAddItemToInventory(actor, inventoryItem);

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
        structures: []
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