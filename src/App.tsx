import { useCallback, useEffect, useRef, useState } from 'react'
import { GameState } from './models/GameState';
import { getGameState, saveGameState } from './GameStateRepository';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Objective } from './enums/Objective';
import { Vector2 } from 'three';

function App() {

  const [gameState, setGameState] = useState<GameState | null>(null);
  const frameRate = useRef<number>(2);
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
