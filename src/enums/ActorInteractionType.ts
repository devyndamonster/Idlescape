import { Actor } from "@/models/entities/Actor";
import { GameEntity } from "@/models/entities/GameEntity";

export enum ActorInteractionType {
    Harvest = 1,
}

export type ActorInteaction = {
    actor: Actor;
    targetEntity: GameEntity;
} & (HarvestInteraction);

export type HarvestInteraction = {
    type: ActorInteractionType.Harvest;
    tool: "none"; //TODO: have a tool type that causes different interactions
}