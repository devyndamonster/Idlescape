import { Vector2 } from "three";

export interface WorldEntity {
    uuid: string;
    location: Vector2;
    size: number;
}