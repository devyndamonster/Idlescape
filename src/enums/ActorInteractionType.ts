import { Actor } from "@/models/entities/Actor";
import { GameEntity } from "@/models/entities/GameEntity";
import { ItemType } from "./ItemType";

export enum ActorInteractionType {
    Harvest = 1,
}

export type ActorInteaction = {
    actor: Actor;
    targetEntity: GameEntity;
} & (HarvestInteraction);

export type HarvestInteraction = {
    type: ActorInteractionType.Harvest;
    toolsUsed: ItemType[];
    itemsProvided: ItemType[];
}