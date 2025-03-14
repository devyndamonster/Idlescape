import { GameState } from "@/models/GameState";
import World from "./world";
import { useRef, useState } from "react";

interface Props {
    gameState: GameState;
    onClickMap?: (x: number, y: number) => void;
}

export default function ScrollableMap({gameState, onClickMap}: Props) {

    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const startDragMouseX = useRef(0);
    const startDragMouseY = useRef(0);
    const startDragPositionX = useRef(0);
    const startDragPositionY = useRef(0);
    const activeDragPointerId = useRef<number | null>(null);
    const pointerContainer = useRef<HTMLDivElement>(null);

    const pointerClickDistanceThreshold = 5;

    const onStartDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if(pointerContainer.current && !activeDragPointerId.current){
            activeDragPointerId.current = event.pointerId;
            startDragMouseX.current = event.clientX;
            startDragMouseY.current = event.clientY;
            startDragPositionX.current = positionX;
            startDragPositionY.current = positionY;

            document.addEventListener('pointermove', onDrag);
            document.addEventListener('pointerup', onStopDrag);
        }
    }

    const onDrag = (event: PointerEvent) => {
        if(activeDragPointerId.current === event.pointerId){
            const mouseDeltaX = event.clientX - startDragMouseX.current;
            const mouseDeltaY = event.clientY - startDragMouseY.current;
            setPositionX(startDragPositionX.current + mouseDeltaX);
            setPositionY(startDragPositionY.current + mouseDeltaY);
        }
    }

    const onStopDrag = (event: PointerEvent) => {
        if(activeDragPointerId.current === event.pointerId){
            activeDragPointerId.current = null;
            document.removeEventListener('pointermove', onDrag);
            document.removeEventListener('pointerup', onStopDrag);

            const mouseDeltaX = event.clientX - startDragMouseX.current;
            const mouseDeltaY = event.clientY - startDragMouseY.current;

            if(Math.abs(mouseDeltaX) < pointerClickDistanceThreshold && Math.abs(mouseDeltaY) < pointerClickDistanceThreshold){
                tryHandleClick(event);
            }
        }
    }

    const tryHandleClick = (event: PointerEvent) => {
        const boundingRect = pointerContainer.current?.getBoundingClientRect();
        if(boundingRect){
            const relativePointerX = event.clientX - boundingRect.left;
            const relativePointerY = event.clientY - boundingRect.top;
            const worldClickX = relativePointerX - positionX;
            const worldClickY = relativePointerY - positionY;

            onClickMap?.(worldClickX, worldClickY);
        }
    }

    return (
        <div>
            <div style={{position: 'absolute', top: positionY, left: positionX}}>
                <World gameState={gameState} />
            </div>
            <div 
                ref={pointerContainer}
                onPointerDown={onStartDrag} 
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, touchAction: 'none' }}
            />
        </div>
    )
}