import { Actor } from "./Actor";
import { Resource } from "./Resource";

export interface GameState {
    currentTick: number;
    actors: Actor[];
    resources: Resource[];
}