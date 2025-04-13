import { EntityType } from "@/enums/EntityType";
import { Blueprint } from "./entities/Blueprint";
import { GameEntity } from "./entities/GameEntity";
import { Resource } from "./entities/Resource";
import { Actor } from "./entities/Actor";

export interface GameState {
    currentTick: number;
    timestamp: number;
    entities: GameEntity[];
}

export function getBlueprints(gameState: GameState): Blueprint[] {
    return gameState.entities.filter(entity => entity.entityType == EntityType.Blueprint);
}

export function getResources(gameState: GameState): Resource[] {
    return gameState.entities.filter(entity => entity.entityType == EntityType.Resource);
}

export function getActors(gameState: GameState): Actor[] {
    return gameState.entities.filter(entity => entity.entityType == EntityType.Actor);
}