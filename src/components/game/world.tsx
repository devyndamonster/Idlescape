import { useCallback, useEffect, useRef } from "react";
import { GameState } from "../../models/GameState";
import { GameData } from "@/models/GameData";
import { EntityType } from "@/enums/EntityType";
import { TerrainType } from "@/models/MapTile";
import { lerp } from "three/src/math/MathUtils.js";

interface Props {
    gameState: GameState;
    gameData: GameData;
}

export default function World({ gameState, gameData }: Props) 
{
    const terrainCanvasRef = useRef<HTMLCanvasElement>(null);
    const shouldTerrainRender = useRef<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStateSnapshot = useRef<GameState>(gameState);
    const gameDataSnapshot = useRef<GameData>(gameData);
    const drawFramesPerSecond = useRef<number>(30);
    const nextFrameTime = useRef<number>(0);

    const renderGame = useCallback(() => {
        if(shouldTerrainRender.current){
            renderTerrain();
            shouldTerrainRender.current = false;
        }

        renderEntities();
    }, [canvasRef]);

    const renderEntities = useCallback(() => {
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

    const renderTerrain = useCallback(() => {
        const canvas = terrainCanvasRef.current;
        if(!canvas){
            return;
        }

        const context = canvas.getContext('2d');
        if(!context){
            return;
        }

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.clearRect(0, 0, canvas.width, canvas.height);

        const tileSize = canvas.width / gameStateSnapshot.current.tileGrid.length;
        const drawHeightText = false;

        for(let row = 0; row < gameStateSnapshot.current.tileGrid.length; row++){
            for(let col = 0; col < gameStateSnapshot.current.tileGrid[row].length; col++){
                const tile = gameStateSnapshot.current.tileGrid[row][col];

                const tileX = col * tileSize;
                const tileY = row * tileSize;

                if(tile.terrainType == TerrainType.Soil){
                    const maxHeightRed = 180
                    const minHeightRed = 0;
                    const red = lerp(minHeightRed, maxHeightRed, tile.height);
                    context.fillStyle = `rgb(${red}, ${208}, ${107})`;
                }
                else if(tile.terrainType == TerrainType.Water){
                    context.fillStyle = `rgb(0, 213, 255)`;
                }
                else if(tile.terrainType == TerrainType.Rock){
                    context.fillStyle = `rgb(166, 166, 166)`;
                }
                else if(tile.terrainType == TerrainType.Sand){
                    context.fillStyle = `rgb(255, 243, 129)`;
                }
                else{
                    context.fillStyle = `rgb(${tile.height * 255}, ${tile.height * 255}, ${tile.height * 255})`;
                }

                
                context.fillRect(tileX, tileY, tileX + tileSize, tileY + tileSize);

                if(drawHeightText){
                    context.fillStyle = 'black';
                    context.font = "8px Arial";
                    context.fillText(tile.height.toFixed(2), tileX + (tileSize / 2), tileY + (tileSize / 2));
                }
            }
        }
    }, [terrainCanvasRef]);

    useEffect(() => {
        let frameId: number;

        const frame = () => {
            frameId = requestAnimationFrame(frame);

            if(nextFrameTime.current < Date.now()){
                const updatedNextFrameTime = Date.now() + (1000 / drawFramesPerSecond.current);
                nextFrameTime.current = updatedNextFrameTime;
                renderGame();
            }
        }

        requestAnimationFrame(frame);

        return () => cancelAnimationFrame(frameId);
    }, [renderGame]);

    useEffect(() => {
        gameStateSnapshot.current = gameState;
    }, [gameState]);

    useEffect(() => {
        gameDataSnapshot.current = gameData;
    }, [gameData]);
    
    return (
        <div
            style={{
                position: 'relative',
                width: `${gameData.worldWidth}px`,
                height: `${gameData.worldHeight}px`,
                margin: '0 auto'
            }}
        >
            <canvas
                id="terrainCanvas"
                ref={terrainCanvasRef}
                width={gameData.worldWidth}
                height={gameData.worldHeight}
                style={{
                    backgroundColor: '#78bf26',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${gameData.worldWidth}px`,
                    height: `${gameData.worldHeight}px`
                }}
            />
            <canvas
                id="canvas"
                ref={canvasRef}
                width={gameData.worldWidth}
                height={gameData.worldHeight}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${gameData.worldWidth}px`,
                    height: `${gameData.worldHeight}px`
                }}
            />
        </div>
    )
}