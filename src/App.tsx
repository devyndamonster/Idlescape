import { useEffect, useRef, useState } from 'react'
import { GameState } from './models/GameState';
import { getGameState, saveGameState } from './GameStateRepository';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Vector2 } from 'three';
import { getClickedActor } from './game/WorldUtils';
import CharacterDialog from './components/game/characterDialog';
import { DefaultGameData, GameData } from './models/GameData';
import { generateInitialGameState, getUpdatedGameState } from './game/GameLogic';
import { UserAction } from './enums/UserAction';
import { BuildableType } from './enums/BuildableType';
import { Structure } from './models/Structure';
import { Actor } from './models/Actor';
import { Button } from './components/ui/button';

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

      if(userAction == UserAction.BuildStockpile){
        const structure: Structure = {
          uuid: crypto.randomUUID(),
          location: clickedLocation,
          size: 50,
          icon: '🏠',
          structureType: BuildableType.Stockpile
        };

        queuedBuildActions.current.push(structure);
      }
      else if(userAction == UserAction.PlantTreeSeed){
        const structure: Structure = {
          uuid: crypto.randomUUID(),
          location: clickedLocation,
          size: 30,
          icon: '🌱',
          structureType: BuildableType.TreeSeed
        };

        queuedBuildActions.current.push(structure);
      }
      else if(userAction == UserAction.PlantGrassSeed){
        const structure: Structure = {
          uuid: crypto.randomUUID(),
          location: clickedLocation,
          size: 30,
          icon: '🌱',
          structureType: BuildableType.GrassSeed
        };

        queuedBuildActions.current.push(structure);
      }
      else if(clickedActor){
        setSelectedActorUuid(clickedActor.uuid);
      }
    }
  };

  const onResetWorld = () => {
    const initialGameState = generateInitialGameState(gameData);
    gameStateRef.current = initialGameState;
    setGameState(initialGameState);
    saveGameState(initialGameState);
  }

  const onActorUpdated = (updatedActor: Actor) => {
    if(gameState){
      const updatedActors = gameState.actors.map(actor => actor.uuid === updatedActor.uuid ? updatedActor : actor);
      const updatedGameState = {
        ...gameState,
        actors: updatedActors
      };

      gameStateRef.current = updatedGameState;
      setGameState(updatedGameState);
      saveGameState(updatedGameState);
    }
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
              <CharacterDialog gameState={gameState} selectedActorUuid={selectedActorUuid} onClose={() => setSelectedActorUuid(null)} onActorUpdated={onActorUpdated}/>
            </>
          )}
          <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px' }}>
              <SidebarTrigger size="default" variant={"outline"} className='h-7'/>
              {userAction != null &&
                <Button size="default" variant={"outline"} className="h-7" onClick={() => setUserAction(null)}>Cancel Building</Button>
              }
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default App
