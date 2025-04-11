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

        console.log(gameDataSnapshot.current.imageCache);

        gameStateSnapshot.current.actors.forEach(actor => {
            const x = actor.location.x - actor.size / 2;
            const y = actor.location.y - actor.size / 2;
            context.drawImage(gameDataSnapshot.current.imageCache["/Idlescape/StickCharacter.svg"], x, y, actor.size, actor.size);
        });

        gameStateSnapshot.current.resources.forEach(resource => {
            const resourceData = gameDataSnapshot.current.resourceSettings[resource.resourceType];

            const x = resource.location.x - resource.size / 2;
            const y = resource.location.y - resource.size / 2;
            context.drawImage(gameDataSnapshot.current.imageCache[resourceData.icon], x, y, resource.size, resource.size);

            if(resource.quantityRemaining < resourceData.initialQuantity){
                const progressBarStartX = resource.location.x - (resource.size / 2);
                const progressBarStartY = resource.location.y + (resource.size / 2);
                const progressBarWidth = resource.size * (resource.quantityRemaining / resourceData.initialQuantity);
                const progressBarHeight = 5;
    
                context.fillStyle = 'lime';
                context.fillRect(progressBarStartX, progressBarStartY, progressBarWidth, progressBarHeight);
            }
        });

        gameStateSnapshot.current.structures.forEach(structure => {
            const x = structure.location.x - structure.size / 2;
            const y = structure.location.y - structure.size / 2;
            context.drawImage(gameDataSnapshot.current.imageCache[structure.icon], x, y, structure.size, structure.size);
        });

        gameStateSnapshot.current.blueprints.forEach(blueprint => {
            const x = blueprint.location.x - blueprint.size / 2;
            const y = blueprint.location.y - blueprint.size / 2;
            context.drawImage(gameDataSnapshot.current.imageCache[blueprint.icon], x, y, blueprint.size, blueprint.size);

            const totalItemCountRequired = blueprint.requiredItems.reduce((a, b) => a + b.quantity, 0);
            const totalItemCountProvided = blueprint.currentItems.reduce((a, b) => a + b.quantity, 0);

            const progressBarStartX = blueprint.location.x - (blueprint.size / 2);
            const progressBarStartY = blueprint.location.y + (blueprint.size / 2);
            const progressBarWidth = blueprint.size;
            const completedBarWidth = blueprint.size * (totalItemCountProvided / totalItemCountRequired);
            const progressBarHeight = 5;

            context.fillStyle = 'blue';
            context.fillRect(progressBarStartX, progressBarStartY, progressBarWidth, progressBarHeight);

            context.fillStyle = 'cyan';
            context.fillRect(progressBarStartX, progressBarStartY, completedBarWidth, progressBarHeight);
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