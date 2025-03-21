import { useEffect, useRef, useState } from 'react'
import { GameState } from './models/GameState';
import { getGameState, saveGameState } from './GameStateRepository';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Objective } from './enums/Objective';
import { Vector2 } from 'three';
import { getClickedActor } from './game/WorldUtils';
import CharacterDialog from './components/game/characterDialog';
import { DefaultGameData, GameData } from './models/GameData';
import { getUpdatedGameState } from './game/GameLogic';
import { UserAction } from './enums/UserAction';
import { BuildableType } from './enums/BuildableType';
import { Structure } from './models/Structure';

function App() {

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [userAction, setUserAction] = useState<UserAction | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const queuedBuildActions = useRef<Structure[]>([]);
  const [gameData] = useState<GameData>(DefaultGameData);
  const [selectedActorUuid, setSelectedActorUuid] = useState<string | null>(null);
  const frameRate = useRef<number>(10);
  const nextFrameTime = useRef<number>(0);

  const runGameLoop = () => {
    const currentGameState = gameStateRef.current ?? getGameState();
    const updatedGameState = getUpdatedGameState(currentGameState, gameData, queuedBuildActions.current);

    queuedBuildActions.current = [];
    gameStateRef.current = updatedGameState;
    saveGameState(updatedGameState);
    setGameState(updatedGameState);
  };

  const onClickMap = (x: number, y: number) => {
    if(gameState){
      const clickedLocation = new Vector2(x, y);
      const clickedActor = getClickedActor(clickedLocation, gameState);

      if(clickedActor){
        setSelectedActorUuid(clickedActor.uuid);
      }

      if(userAction == UserAction.BuildStockpile){
        const structure: Structure = {
          uuid: crypto.randomUUID(),
          location: clickedLocation,
          size: 50,
          structureType: BuildableType.Stockpile
        };

        queuedBuildActions.current.push(structure);
        setUserAction(null);
      }
    }
  };

  const onResetWorld = () => {
    const initialGameState: GameState = {
      currentTick: 0,
      timestamp: Date.now(),
      actors: [{
        location: new Vector2(100, 100),
        moveSpeed: 2,
        size: 20,
        harvestProgress: 0,
        uuid: crypto.randomUUID(),
        inventory: [...Array(10)].map(_ => ({ item: null, quantity: 0 })),
        currentObjective: Objective.CollectSticks
      }],
      resources: [],
      structures: []
    }

    gameStateRef.current = initialGameState;
    setGameState(initialGameState);
    saveGameState(initialGameState);
  }

  useEffect(() => {
    let frameId: number;

    const frame = () => {
      frameId = requestAnimationFrame(frame);

      if(nextFrameTime.current < Date.now()){
        const updatedNextFrameTime = Date.now() + (1000 / frameRate.current);
        nextFrameTime.current = updatedNextFrameTime;
        runGameLoop();
      }
    }

    requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  }, [runGameLoop]);

  return (
    <>
      <SidebarProvider>
        <GameSideBar onResetWorld={onResetWorld} onUserActionStarted={setUserAction}/>
        <SidebarInset style={{overflow: 'hidden'}}>
          {gameState && (
            <>
              <ScrollableMap gameState={gameState} gameData={gameData} onClickMap={onClickMap} />
              <CharacterDialog gameState={gameState} selectedActorUuid={selectedActorUuid} onClose={() => setSelectedActorUuid(null)}/>
            </>
          )}
          <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <SidebarTrigger/>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default App
