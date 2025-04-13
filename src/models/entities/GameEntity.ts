import { Actor } from "./Actor";
import { Blueprint } from "./Blueprint";
import { Resource } from "./Resource";
import { Structure } from "./Structure";

export type GameEntity = 
    Resource | 
    Blueprint | 
    Structure | 
    Actor