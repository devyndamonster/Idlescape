import { ActionType } from "@/enums/ActionType";
import { ResourceType } from "@/enums/ResourceType";
import { GameData } from "@/models/GameData";
import { GameState } from "@/models/GameState";
import { Vector2 } from "three";
import { getActorAction, tryAddItemToInventory } from "./ActorLogic";
import { InventoryItem } from "@/models/InventoryItem";
import { Structure } from "@/models/Structure";

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

function getDeltaTimeSeconds(previousTime: number){
    return (Date.now() - previousTime) / 1000;
}