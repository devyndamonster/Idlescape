import { Vector2 } from "three";
import { GameState } from "./models/GameState";

export function getGameState(): GameState {
    var gameStateJson = localStorage.getItem("gameState");

    if (gameStateJson) {
        return JSON.parse(gameStateJson, gameStateReviver);
    }

    return {
        currentTick: 0,
        actors: [],
        resources: [],
    };
}

export function saveGameState(gameState: GameState | null) {
    if(!gameState){
        localStorage.removeItem("gameState");
    }
    else{
        localStorage.setItem("gameState", JSON.stringify(gameState, gameStateReplacer));
    }
}

function gameStateReplacer(_: string, value: any) {
    if(value instanceof Vector2){
        return {
            x: value.x,
            y: value.y,
            serializedType: "Vector2"
        }
    }

    return value;
}

function gameStateReviver(_: string, value: any) {
    if(value.serializedType === "Vector2"){
        return new Vector2(value.x, value.y);
    }

    return value;
}