import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { GameState } from './models/GameState';
import { getGameState } from './GameStateRepository';

function App() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const frameRate = useRef<number>(2);
  const nextFrameTime = useRef<number>(0);

  const runGameLoop = useCallback(() => {
    console.log("Game Loop");

    const canvas = canvasRef.current;
    if(!canvas){
      return;
    }

    const context = canvas.getContext('2d');
    if(!context){
      return;
    }

    setGameState((gameState) => {
      let currentGameState: GameState | undefined = undefined;

      if(!gameState){
        currentGameState = {...getGameState()};
      }
      else{
        currentGameState = {...gameState};
      }
      
      currentGameState.currentTick += 1;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "48px serif";
      context.fillText(`${currentGameState.currentTick}`, 10, 50);

      return currentGameState;
    });
  }, [gameState, canvasRef]);


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
      <canvas 
      id="canvas" 
      ref={canvasRef} 
      width={1080} 
      height={1080}
      style={{
        backgroundColor: 'green',
        display: 'block',
        margin: '0 auto',
        width: '100%',
        maxWidth: '1080px',
        height: 'auto'
      }}
      />
    </>
  )
}

export default App
