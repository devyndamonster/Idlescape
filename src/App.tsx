import { useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Vector2 } from 'three';
import { getClickedActor } from './game/WorldUtils';
import CharacterDialog from './components/game/characterDialog';
import { UserActionType } from './enums/UserAction';
import { Actor } from './models/Actor';
import { Button } from './components/ui/button';
import { UserAction } from './models/UserAction';
import { GameUpdateType, useGameData, useGameState, useGameUpdateQueue } from './game/GameContext';

function App() {
  const gameState = useGameState();
  const gameData = useGameData();
  const queueUpdate = useGameUpdateQueue();
  const [userAction, setUserAction] = useState<UserAction | null>(null);
  const [selectedActorUuid, setSelectedActorUuid] = useState<string | null>(null);

  const onClickMap = (x: number, y: number) => {
    if(gameState){
      const clickedLocation = new Vector2(x, y);
      const clickedActor = getClickedActor(clickedLocation, gameState);

      if(userAction?.actionType == UserActionType.Build){
        queueUpdate({
          updateType: GameUpdateType.BuildAction,
          buildableType: userAction.buildableType,
          location: clickedLocation
        })
      }
      else if(clickedActor){
        setSelectedActorUuid(clickedActor.uuid);
      }
    }
  };

  const onResetWorld = () => {
    queueUpdate({
      updateType: GameUpdateType.ResetWorld,
    })
  }

  const onActorUpdated = (updatedActor: Actor) => {
    queueUpdate({
      updateType: GameUpdateType.UpdateActor,
      actorUuid: updatedActor.uuid,
      updatedActor: updatedActor
    })
  }

  return (
    <SidebarProvider>
      <GameSideBar onResetWorld={onResetWorld} onUserActionStarted={setUserAction}/>
      <SidebarInset style={{overflow: 'hidden'}}>
        {gameState && gameData && (
          <>
            <ScrollableMap gameState={gameState} gameData={gameData} onClickMap={onClickMap} />
            <CharacterDialog gameState={gameState} selectedActorUuid={selectedActorUuid} onClose={() => setSelectedActorUuid(null)} onActorUpdated={onActorUpdated}/>
          </>
        )}
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px' }}>
            <SidebarTrigger size="default" variant={"outline"} className='h-7'/>
            {userAction != null &&
              <Button size="default" variant={"outline"} className="h-7" onClick={() => setUserAction(null)}>Cancel Building</Button>
            }
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
