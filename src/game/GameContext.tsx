
import { getGameState, saveGameState } from '@/GameStateRepository';
import { DefaultGameData, GameData } from '@/models/GameData';
import { GameState } from '@/models/GameState';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { generateInitialGameState, getUpdatedGameState, loadSVGImage } from './GameLogic';
import { BuildableType } from '@/enums/BuildableType';
import { Vector2 } from 'three';
import { Actor } from '@/models/Actor';

export const GameStateContext = createContext<GameState | undefined>(undefined);
export const GameDataContext = createContext<GameData | undefined>(undefined);
export const GameUpdateQueueContext = createContext<((gameUpdate: GameUpdate) => void) | undefined>(undefined);

export function GameContextProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const gameStateRef = useRef<GameState | undefined>(undefined);
  const [gameData, setGameData] = useState<GameData | undefined>(undefined);
  const gameDataRef = useRef<GameData | undefined>(undefined);
  const gameUpdates = useRef<GameUpdate[]>([]);
  const frameRate = useRef<number>(10);
  const nextFrameTime = useRef<number>(0);

  const queueGameUpdate = (gameUpdate: GameUpdate) => {
    if(gameUpdate.updateType == GameUpdateType.ResetWorld && gameDataRef.current){
      gameUpdates.current = [];

      const initialGameState = generateInitialGameState(gameDataRef.current);

      gameStateRef.current = initialGameState;
      setGameState(initialGameState);
      saveGameState(initialGameState);
    }
    else{
      gameUpdates.current.push(gameUpdate);
    }
  }

  const runGameLoop = () => {
    const gameData = gameDataRef.current;
    if (!gameData) throw new Error("Game data is not loaded yet.");

    const currentGameState = gameStateRef.current ?? getGameState();
    const updatedGameState = getUpdatedGameState(currentGameState, gameData, gameUpdates.current);

    gameUpdates.current = [];
    gameStateRef.current = updatedGameState;
    saveGameState(updatedGameState);
    setGameState(updatedGameState);
  };

  useEffect(() => {
    let frameId: number;

    const frame = () => {
      frameId = requestAnimationFrame(frame);

      if(gameDataRef.current && nextFrameTime.current < Date.now()){
        const updatedNextFrameTime = Date.now() + (1000 / frameRate.current);
        nextFrameTime.current = updatedNextFrameTime;
        runGameLoop();
      }
    }

    requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  }, [runGameLoop]);

  useEffect(() => {
    const loadGameData = async () => {
      const defaultGameData = DefaultGameData;
      
      const blueprintIcons = Object.values(defaultGameData.blueprintData).map(blueprint => blueprint.icon);
      const resourceIcons = Object.values(defaultGameData.resourceSettings).map(resource => resource.icon);
      const allIcons = new Set<string>([...blueprintIcons, ...resourceIcons, "/Idlescape/StickCharacter.svg"]);

      const imageCache: Record<string, HTMLImageElement> = {};
      for (const icon of allIcons) {
        const image = await loadSVGImage(icon);
        imageCache[icon] = image;
      }

      const cachedGameData = {...defaultGameData, imageCache: imageCache };

      gameDataRef.current = cachedGameData;
      setGameData(cachedGameData);
    }

    loadGameData();
  }, []);

  return (
    <GameDataContext.Provider value={gameData}>
      <GameStateContext.Provider value={gameState}>
        <GameUpdateQueueContext.Provider value={queueGameUpdate}>
          <>
            {(gameState && gameData) ? (
              children
            ) :
            (<div>Loading...</div>)}
          </>
        </GameUpdateQueueContext.Provider>
      </GameStateContext.Provider>
    </GameDataContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameContextProvider');
  }
  return context;
}

export function useGameData() {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameContextProvider');
  }
  return context;
}

export function useGameUpdateQueue() {
  const context = useContext(GameUpdateQueueContext);
  if (context === undefined) {
    throw new Error('useGameUpdateQueue must be used within a GameContextProvider');
  }
  return context;
}

export type GameUpdate = 
  ResetWorldAction | 
  BuildAction | 
  UpdateActorAction;

export type ResetWorldAction = {
  updateType: GameUpdateType.ResetWorld;
}

export type BuildAction = {
  updateType: GameUpdateType.BuildAction;
  buildableType: BuildableType;
  location: Vector2;
}

export type UpdateActorAction = {
  updateType: GameUpdateType.UpdateActor;
  actorUuid: string;
  updatedActor: Actor;
}

export enum GameUpdateType {
  ResetWorld = 1,
  BuildAction = 2,
  UpdateActor = 3,
}
