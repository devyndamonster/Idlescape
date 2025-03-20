import { Actor } from "./Actor";
import { Resource } from "./Resource";

export interface GameState {
    currentTick: number;
    timestamp: number;
    actors: Actor[];
    resources: Resource[];
}