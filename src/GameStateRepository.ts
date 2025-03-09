import { GameState } from "./models/GameState";

export function getGameState(): GameState {
    var gameStateJson = localStorage.getItem("gameState");

    if (gameStateJson) {
        return JSON.parse(gameStateJson);
    }

    return {
        currentTick: 0,
        actors: []
    };
}

export function saveGameState(gameState: GameState) {
    localStorage.setItem("gameState", JSON.stringify(gameState));
}