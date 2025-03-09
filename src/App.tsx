import { useCallback, useEffect, useRef, useState } from 'react'
import { GameState } from './models/GameState';
import { getGameState, saveGameState } from './GameStateRepository';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import World from './components/game/world';

function App() {

  const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const frameRate = useRef<number>(2);
  const nextFrameTime = useRef<number>(0);

  const runGameLoop = useCallback(() => {
    console.log("Game Loop");

    setGameState((gameState) => {
      let currentGameState: GameState | undefined = undefined;

      if(!gameState){
        currentGameState = {...getGameState()};
      }
      else{
        currentGameState = {...gameState};
      }
      
      currentGameState.currentTick += 1;

      saveGameState(currentGameState);
      return currentGameState;
    });
  }, [gameState]);


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
        <GameSideBar />
        <main>
          <SidebarTrigger />
          {gameState && <World gameState={gameState} />}
        </main>
      </SidebarProvider>
    </>
  )
}

export default App
