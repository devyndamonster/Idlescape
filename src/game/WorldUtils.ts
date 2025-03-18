import { ResourceType } from "@/enums/ResourceType";
import { Actor } from "@/models/Actor";
import { GameState } from "@/models/GameState";
import { Resource } from "@/models/Resource";
import { Vector2 } from "three";

export function getNearestResource(startLocation: Vector2, resourceType: ResourceType, gameState: GameState): Resource | null {
    let minDistance = Number.MAX_VALUE;
    let nearestResource: Resource | null = null;

    for(const resource of gameState.resources) {
        if(resource.resourceType === resourceType) {
            const distance = startLocation.distanceTo(resource.location);
            if(distance < minDistance) {
                minDistance = distance;
                nearestResource = resource;
            }
        }
    }

    return nearestResource;
}

export function getClickedActor(clickLocation: Vector2, gameState: GameState): Actor | null {
    for(const actor of gameState.actors) {
        if(actor.location.distanceTo(clickLocation) < actor.size) {
            return actor;
        }
    }

    return null;
}