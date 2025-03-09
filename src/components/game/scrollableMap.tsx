import { GameState } from "@/models/GameState";
import World from "./world";
import { useRef, useState } from "react";

interface Props {
    gameState: GameState;
}

export default function ScrollableMap({gameState}: Props) {

    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const startDragMouseX = useRef(0);
    const startDragMouseY = useRef(0);
    const startDragPositionX = useRef(0);
    const startDragPositionY = useRef(0);
    const isDragging = useRef(false);

    const onStartDrag = (event: React.MouseEvent<HTMLDivElement>) => {
        if(!isDragging.current){

            isDragging.current = true;
            startDragMouseX.current = event.clientX;
            startDragMouseY.current = event.clientY;
            startDragPositionX.current = positionX;
            startDragPositionY.current = positionY;

            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', onStopDrag);
        }
    }

    const onDrag = (event: MouseEvent) => {
        if(isDragging){

            const mouseDeltaX = event.clientX - startDragMouseX.current;
            const mouseDeltaY = event.clientY - startDragMouseY.current;
            setPositionX(startDragPositionX.current + mouseDeltaX);
            setPositionY(startDragPositionY.current + mouseDeltaY);
        }
    }

    const onStopDrag = () => {
        if(isDragging){

            isDragging.current = false
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onStopDrag);
        }
    }

    return (
        <div>
            <div style={{position: 'absolute', top: positionY, left: positionX}}>
                <World gameState={gameState} />
            </div>
            <div onMouseDown={onStartDrag} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}/>
        </div>
    )
}