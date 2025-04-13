import { useCallback, useEffect, useRef } from "react";
import { GameState } from "../../models/GameState";
import { GameData } from "@/models/GameData";
import { EntityType } from "@/enums/EntityType";

interface Props {
    gameState: GameState;
    gameData: GameData;
}

export default function World({ gameState, gameData }: Props) 
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStateSnapshot = useRef<GameState>(gameState);
    const gameDataSnapshot = useRef<GameData>(gameData);
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

        gameStateSnapshot.current.entities.forEach(entity => {
            const x = entity.location.x - entity.size / 2;
            const y = entity.location.y - entity.size / 2;
            context.drawImage(gameDataSnapshot.current.imageCache[entity.icon], x, y, entity.size, entity.size);

            if(entity.entityType == EntityType.Resource){
                const resourceData = gameDataSnapshot.current.resourceSettings[entity.resourceType];

                if(entity.quantityRemaining < resourceData.initialQuantity){
                    const progressBarStartX = entity.location.x - (entity.size / 2);
                    const progressBarStartY = entity.location.y + (entity.size / 2);
                    const progressBarWidth = entity.size * (entity.quantityRemaining / resourceData.initialQuantity);
                    const progressBarHeight = 5;
        
                    context.fillStyle = 'lime';
                    context.fillRect(progressBarStartX, progressBarStartY, progressBarWidth, progressBarHeight);
                }
            }

            else if(entity.entityType == EntityType.Blueprint){
                const totalItemCountRequired = entity.requiredItems.reduce((a, b) => a + b.quantity, 0);
                const totalItemCountProvided = entity.currentItems.reduce((a, b) => a + b.quantity, 0);

                const progressBarStartX = entity.location.x - (entity.size / 2);
                const progressBarStartY = entity.location.y + (entity.size / 2);
                const progressBarWidth = entity.size;
                const completedBarWidth = entity.size * (totalItemCountProvided / totalItemCountRequired);
                const progressBarHeight = 5;

                context.fillStyle = 'blue';
                context.fillRect(progressBarStartX, progressBarStartY, progressBarWidth, progressBarHeight);

                context.fillStyle = 'cyan';
                context.fillRect(progressBarStartX, progressBarStartY, completedBarWidth, progressBarHeight);
            }
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

    useEffect(() => {
        gameDataSnapshot.current = gameData;
    }, [gameData]);

    return (
        <canvas 
            id="canvas" 
            ref={canvasRef} 
            width={gameData.worldWidth} 
            height={gameData.worldHeight}
            style={{
                backgroundColor: '#78bf26',
                display: 'block',
                margin: '0 auto',
                width: `${gameData.worldWidth}px`,
                height: `${gameData.worldHeight}px`
            }}
        />
    )
}