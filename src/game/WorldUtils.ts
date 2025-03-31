import { ResourceType } from "@/enums/ResourceType";
import { Actor } from "@/models/Actor";
import { GameState } from "@/models/GameState";
import { Resource } from "@/models/Resource";
import { WorldEntity } from "@/models/WorldEntity";
import { Vector2 } from "three";

export function getNearestResource(startLocation: Vector2, resourceType: ResourceType, gameState: GameState): Resource | null {
    const resources = gameState.resources.filter(resource => resource.resourceType === resourceType);
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
    for(const actor of gameState.actors) {
        if(actor.location.distanceTo(clickLocation) < actor.size) {
            return actor;
        }
    }

    return null;
}
