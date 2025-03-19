import { useCallback, useEffect, useRef } from "react";
import { GameState } from "../../models/GameState";
import { GameData } from "@/models/GameData";

interface Props {
    gameState: GameState;
    gameData: GameData;
}

export default function World({ gameState, gameData }: Props) 
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStateSnapshot = useRef<GameState>(gameState);
    const drawFramesPerSecond = useRef<number>(30);
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

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "48px serif";
        context.fillText(`${gameStateSnapshot.current.currentTick}`, 50, 50);

        gameStateSnapshot.current.actors.forEach(actor => {
            context.font = `${actor.size}px serif`;
            context.fillText('🙂', actor.location.x, actor.location.y);
        });

        gameStateSnapshot.current.resources.forEach(resource => {
            context.font = `${resource.size}px serif`;
            context.fillText('🪵', resource.location.x, resource.location.y);

            const progressBarStartX = resource.location.x - (resource.size / 2);
            const progressBarStartY = resource.location.y + (resource.size / 2);
            const progressBarWidth = resource.size * (resource.quantityRemaining / gameData.resourceSettings[resource.resourceType].initialQuantity);
            const progressBarHeight = 5;

            context.fillStyle = 'lime';
            context.fillRect(progressBarStartX, progressBarStartY, progressBarWidth, progressBarHeight);
        });
        
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