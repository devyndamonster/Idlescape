import { useCallback, useEffect, useRef } from "react";
import { GameState } from "../../models/GameState";

interface Props {
    gameState: GameState;
}

export default function World({ gameState }: Props) 
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStateSnapshot = useRef<GameState>(gameState);
    const drawFramesPerSecond = useRef<number>(4);
    const nextFrameTime = useRef<number>(0);

    const runGameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if(!canvas){
            return;
        }

        const context = canvas.getContext('2d');
        if(!context){
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "48px serif";
        context.fillText(`${gameStateSnapshot.current.currentTick}`, 10, 50);
    }, [canvasRef]);

    useEffect(() => {
        let frameId: number;

        const frame = () => {
            frameId = requestAnimationFrame(frame);

            if(nextFrameTime.current < Date.now()){
                const updatedNextFrameTime = Date.now() + (1000 / drawFramesPerSecond.current);
                nextFrameTime.current = updatedNextFrameTime;
                runGameLoop();
            }
        }

        requestAnimationFrame(frame);

        return () => cancelAnimationFrame(frameId);
    }, [runGameLoop]);

    useEffect(() => {
        gameStateSnapshot.current = gameState;
    }, [gameState]);

    return (
        <canvas 
            id="canvas" 
            ref={canvasRef} 
            width={1000} 
            height={1000}
            style={{
                backgroundColor: 'green',
                display: 'block',
                margin: '0 auto',
                width: '1000px',
                height: '1000px'
            }}
        />
    )
}