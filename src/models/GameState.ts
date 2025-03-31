import { Actor } from "./Actor";
import { Blueprint } from "./Blueprint";
import { Resource } from "./Resource";
import { Structure } from "./Structure";

export interface GameState {
    currentTick: number;
    timestamp: number;
    actors: Actor[];
    resources: Resource[];
    structures: Structure[];
    blueprints: Blueprint[];
}