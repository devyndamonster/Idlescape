import { useEffect, useRef, useState } from 'react'
import { GameState } from './models/GameState';
import { getGameState, saveGameState } from './GameStateRepository';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Objective } from './enums/Objective';
import { Vector2 } from 'three';
import { getActorAction } from './game/ActorLogic';
import { ActionType } from './enums/ActionType';
import { getClickedActor } from './game/WorldUtils';
import CharacterDialog from './components/game/characterDialog';
import { DefaultGameData, GameData } from './models/GameData';
import { ResourceType } from './enums/ResourceType';

function App() {

  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const [gameData] = useState<GameData>(DefaultGameData);
  const [selectedActorUuid, setSelectedActorUuid] = useState<string | null>(null);
  const frameRate = useRef<number>(10);
  const nextFrameTime = useRef<number>(0);

  const runGameLoop = () => {
    let currentGameState: GameState | undefined = undefined;

    if(!gameStateRef.current){
      currentGameState = {...getGameState()};
    }
    else{
      currentGameState = {...gameStateRef.current};
    }
    
    currentGameState.currentTick += 1;

    for(const actor of currentGameState.actors){
      const action = getActorAction(actor, currentGameState);
      
      if(action.actionType == ActionType.Collect){
        const targetResource = currentGameState.resources.find(r => r.uuid === action.targetResource.uuid);
        if(targetResource){
          const harvestDelta = (1 / frameRate.current) / targetResource.harvestTime;
          actor.harvestProgress += harvestDelta;
          if(actor.harvestProgress >= 1)
          {
            actor.harvestProgress = 0;
            //TODO increase inventory
            //actor.inventory.push({name})

            targetResource.quantityRemaining -= 1;
            if(targetResource.quantityRemaining <= 0){
              currentGameState.resources = currentGameState.resources.filter(r => r.uuid !== targetResource.uuid);
            }
          }
        }
      }
      else if(action.actionType == ActionType.Move){
        actor.location.add(action.direction.clone().multiplyScalar(actor.moveSpeed));
      }
    }

    const chanceOfResourceSpawn = 0.01;
    if(Math.random() < chanceOfResourceSpawn){
      const resourceData = gameData.resourceSettings[ResourceType.Stick];
      currentGameState.resources.push({
        uuid: crypto.randomUUID(),
        location: new Vector2(Math.random() * 1000, Math.random() * 1000),
        quantityRemaining: resourceData.initialQuantity,
        size: resourceData.size,
        harvestTime: resourceData.harvestTime,
        resourceType: resourceData.resourceType,
      });
    }

    gameStateRef.current = currentGameState;
    saveGameState(currentGameState);
    setGameState(currentGameState);
  };

  const onClickMap = (x: number, y: number) => {
    if(gameState){
      const clickedLocation = new Vector2(x, y);
      const clickedActor = getClickedActor(clickedLocation, gameState);

      if(clickedActor){
        setSelectedActorUuid(clickedActor.uuid);
      }
    }
  };

  const onResetWorld = () => {
    const initialGameState: GameState = {
      currentTick: 0,
      actors: [{
        location: new Vector2(100, 100),
        moveSpeed: 2,
        size: 20,
        harvestProgress: 0,
        uuid: crypto.randomUUID(),
        inventory: [],
        currentObjective: Objective.CollectSticks
      }],
      resources: []
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
        <GameSideBar onResetWorld={onResetWorld} />
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
