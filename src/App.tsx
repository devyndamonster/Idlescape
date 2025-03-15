import { useCallback, useEffect, useRef, useState } from 'react'
import { GameState } from './models/GameState';
import { getGameState, saveGameState } from './GameStateRepository';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Objective } from './enums/Objective';
import { Vector2 } from 'three';
import { getActorAction } from './game/ActorLogic';
import { ActionType } from './enums/ActionType';
import { ResourceType } from './enums/ResourceType';

function App() {

  const [gameState, setGameState] = useState<GameState | null>(null);
  const frameRate = useRef<number>(10);
  const nextFrameTime = useRef<number>(0);

  const runGameLoop = useCallback(() => {
    setGameState((gameState) => {
      let currentGameState: GameState | undefined = undefined;

      if(!gameState){
        currentGameState = {...getGameState()};
      }
      else{
        currentGameState = {...gameState};
      }
      
      currentGameState.currentTick += 1;

      for(const actor of currentGameState.actors){
        const action = getActorAction(actor, currentGameState);
        
        if(action.actionType == ActionType.Collect){
          const harvestDelta = (1 / frameRate.current) / action.targetResource.harvestTime;
          actor.harvestProgress += harvestDelta;
          if(actor.harvestProgress >= 1)
          {
            //TODO increase inventory
            //actor.inventory.push({name})

            action.targetResource.quantityRemaining -= 1;
            if(action.targetResource.quantityRemaining <= 0){
              currentGameState.resources = currentGameState.resources.filter(r => r.uuid !== action.targetResource.uuid);
            }
          }
        }
        else if(action.actionType == ActionType.Move){
          actor.location.add(action.direction.clone().multiplyScalar(actor.moveSpeed));
        }
      }

      const chanceOfResourceSpawn = 0.1;
      const randomNumber = Math.random();

      console.log(`Trying to spawn resource: ${randomNumber}`);
      if(Math.random() < chanceOfResourceSpawn){
        currentGameState.resources.push({
          uuid: crypto.randomUUID(),
          location: new Vector2(Math.random() * 1000, Math.random() * 1000),
          quantityRemaining: 5,
          harvestTime: 5,
          collectionRadius: 5,
          resourceType: ResourceType.Stick,
        });
      }

      saveGameState(currentGameState);
      return currentGameState;
    });
  }, [gameState]);

  const onClickMap = (x: number, y: number) => {
    if(gameState){
      const newGameState: GameState = {
        ...gameState,
        actors: [
          ...gameState.actors,
          {
            location: new Vector2(x, y),
            moveSpeed: 2,
            harvestProgress: 0,
            uuid: crypto.randomUUID(),
            inventory: [],
            currentObjective: Objective.CollectSticks
          }
        ]
      }

      setGameState(newGameState);
    }
  };

  const onResetWorld = () => {
    setGameState(null);
    saveGameState(null);
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
          {gameState && <ScrollableMap gameState={gameState} onClickMap={onClickMap} />}
          <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <SidebarTrigger/>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default App
