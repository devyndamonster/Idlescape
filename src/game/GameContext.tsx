
import { getGameState, saveGameState } from '@/GameStateRepository';
import { DefaultGameData, GameData } from '@/models/GameData';
import { GameState } from '@/models/GameState';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { generateInitialGameState, getUpdatedGameState, loadSVGImage } from './GameLogic';
import { BuildableType } from '@/enums/BuildableType';
import { Vector2 } from 'three';
import { Actor } from '@/models/entities/Actor';
import { AppState, initialAppState } from '@/models/AppState';

export const GameStateContext = createContext<GameState | undefined>(undefined);
export const GameDataContext = createContext<GameData | undefined>(undefined);
export const GameUpdateQueueContext = createContext<((gameUpdate: GameUpdate) => void) | undefined>(undefined);
export const AppStateContext = createContext<AppState>(initialAppState);

export function GameContextProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const gameStateRef = useRef<GameState | undefined>(undefined);
  const [gameData, setGameData] = useState<GameData | undefined>(undefined);
  const gameDataRef = useRef<GameData | undefined>(undefined);
  const gameUpdates = useRef<GameUpdate[]>([]);
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const appStateRef = useRef<AppState>(initialAppState);
  const frameRate = useRef<number>(16);
  const nextFrameTime = useRef<number>(0);


  const updateGameState = (newGameState: GameState) => {
    gameStateRef.current = newGameState;
    setGameState(newGameState);
    saveGameState(newGameState);
  }

  const updateAppState = (newAppState: AppState) => {
    appStateRef.current = newAppState;
    setAppState(newAppState);
  }

  const queueGameUpdate = (gameUpdate: GameUpdate) => {
    if(gameUpdate.updateType == GameUpdateType.ResetWorld && gameDataRef.current){
      gameUpdates.current = [];

      const initialGameState = generateInitialGameState(gameDataRef.current);
      updateGameState(initialGameState);
    }
    else if(gameUpdate.updateType == GameUpdateType.FastForward){
      updateAppState({
        ...appStateRef.current,
        isFastForwarding: true,
        isPaused: false,
      });
    }
    else if(gameUpdate.updateType == GameUpdateType.Pause){
      updateAppState({
        ...appStateRef.current,
        isPaused: true,
      });
    }
    else{
      gameUpdates.current.push(gameUpdate);
    }
  }

  const runGameLoop = () => {
    const gameData = gameDataRef.current;
    if (!gameData) throw new Error("Game data is not loaded yet.");

    const currentGameState = gameStateRef.current ?? getGameState();
    let updatedGameState = currentGameState;

    if(shouldPauseForFastForward(currentGameState, appStateRef.current))
    {
      updateAppState({
        ...appStateRef.current,
        isPaused: true,
      });
    }

    const timeOfUpdate = getNextUpdateTime(currentGameState, appStateRef.current);
    updatedGameState = getUpdatedGameState(currentGameState, gameData, timeOfUpdate, gameUpdates.current);

    if(appStateRef.current.isFastForwarding && timeOfUpdate >= Date.now())
    {
      updateAppState({
        ...appStateRef.current,
        isFastForwarding: false,
      });
    }

    gameUpdates.current = [];
    updateGameState(updatedGameState);
  };

  const shouldPauseForFastForward = (gameState: GameState, appState: AppState) => {
    const secondsSinceLastUpdate = (Date.now() - gameState.timestamp) / 1000;
    return secondsSinceLastUpdate > appState.requiredSecondsToFastForward && !appState.isFastForwarding;
  }

  const getNextUpdateTime = (gameState: GameState, appState: AppState) => {
    if(appState.isPaused) 
    {
      return gameState.timestamp;
    }

    //Ensure that the fastest the time can jump forward is based on the fast forward time
    const fastForwardedTime = gameState.timestamp + (appState.fastForwardSecondsIncrement * 1000);
    const timeOfUpdate = Math.min(fastForwardedTime, Date.now());

    return timeOfUpdate;
  }

  useEffect(() => {
    let frameId: number;

    const frame = () => {
      frameId = requestAnimationFrame(frame);

      if(gameDataRef.current && nextFrameTime.current < Date.now()){
        const targetFrameRate = appStateRef.current.isFastForwarding ? 1000 : frameRate.current;
        const updatedNextFrameTime = Date.now() + (1000 / targetFrameRate);
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
    <AppStateContext.Provider value={appState}>
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
    </AppStateContext.Provider>
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

export function useAppState() {
  const context = useContext(AppStateContext);
  return context;
}

export type GameUpdate = 
  ResetWorldAction | 
  BuildAction | 
  UpdateActorAction |
  FastForwardAction |
  PauseAction;

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

export type FastForwardAction = {
  updateType: GameUpdateType.FastForward;
}

export type PauseAction = {
  updateType: GameUpdateType.Pause;
}

export enum GameUpdateType {
  ResetWorld = 1,
  BuildAction = 2,
  UpdateActor = 3,
  FastForward = 4,
  Pause = 5,
}
