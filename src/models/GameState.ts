import { Actor } from "./Actor";

export interface GameState {
    currentTick: number;
    actors: Actor[];
}