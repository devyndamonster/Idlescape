import { GameState } from "./models/GameState";

export function getGameState(): GameState {
    return {
        currentTick: 0
    };
}