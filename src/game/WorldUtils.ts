import { ResourceType } from "@/enums/ResourceType";
import { Actor } from "@/models/entities/Actor";
import { GameState, getActors, getResources } from "@/models/GameState";
import { Resource } from "@/models/entities/Resource";
import { WorldEntity } from "@/models/entities/WorldEntity";
import { Vector2 } from "three";

export function getNearestResource(startLocation: Vector2, resourceType: ResourceType, gameState: GameState): Resource | null {
    const resources = getResources(gameState).filter(resource => resource.resourceType === resourceType && resource.quantityRemaining > 0);
    return getNearestEntity(startLocation, resources);
}

export function getNearestEntity<T extends WorldEntity>(startLocation: Vector2, entities: T[]){
    let minDistance = Number.MAX_VALUE;
    let nearestEntity: T | null = null;

    for(const entity of entities) {
        const distance = startLocation.distanceTo(entity.location);
        if(distance < minDistance) {
            minDistance = distance;
            nearestEntity = entity;
        }
    }

    return nearestEntity;
}

export function getClickedActor(clickLocation: Vector2, gameState: GameState): Actor | null {
    const actors = getActors(gameState);
    for(const actor of actors) {
        if(actor.location.distanceTo(clickLocation) < actor.size) {
            return actor;
        }
    }

    return null;
}
