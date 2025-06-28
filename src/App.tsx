import { useMemo, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { GameSideBar } from './components/game/gameSideBar';
import ScrollableMap from './components/game/scrollableMap';
import { Vector2 } from 'three';
import { getClickedActor } from './game/WorldUtils';
import CharacterDialog from './components/game/characterDialog';
import { UserActionType } from './enums/UserAction';
import { Actor } from './models/entities/Actor';
import { Button } from './components/ui/button';
import { UserAction } from './models/UserAction';
import { GameUpdateType, useAppState, useGameData, useGameState, useGameUpdateQueue } from './game/GameContext';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';

function App() {
  const gameState = useGameState();
  const gameData = useGameData();
  const appState = useAppState();
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

  const timeSinceLastUpdate = ((Date.now() - gameState.timestamp) / 1000);
  const displayFastForwardAlert = timeSinceLastUpdate > appState.requiredSecondsToFastForward && !appState.isFastForwarding


  //Format: April 1, 2023 12:00:00 AM
  const dateFormatRef = useMemo(() => new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }), []);

  const formattedDate = dateFormatRef.format(new Date(gameState.timestamp));

  return (
    <SidebarProvider>
      <GameSideBar onResetWorld={onResetWorld} onUserActionStarted={setUserAction}/>
      <SidebarInset style={{overflow: 'hidden'}}>
        {gameState && gameData && (
          <>
            <ScrollableMap gameState={gameState} gameData={gameData} onClickMap={onClickMap} />
            <AlertDialog open={displayFastForwardAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fast Forward!</AlertDialogTitle>
                  <AlertDialogDescription>
                    It has been X seconds since the last update, prepare to fast forward time
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => queueUpdate({updateType: GameUpdateType.FastForward})}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={gameState.isGameOver}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Game Over</AlertDialogTitle>
                  <AlertDialogDescription>
                    Everyone has died!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => queueUpdate({updateType: GameUpdateType.ResetWorld})}>Reset World</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <CharacterDialog gameState={gameState} selectedActorUuid={selectedActorUuid} onClose={() => setSelectedActorUuid(null)} onActorUpdated={onActorUpdated}/>
          </>
        )}
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px' }}>
            <SidebarTrigger size="default" variant={"outline"} className='h-7'/>
            {!appState.isPaused ? 
              (
                <Button size="default" variant={"outline"} className="h-7" onClick={() => queueUpdate({updateType: GameUpdateType.Pause})}>Pause - {formattedDate}</Button>
              ) : (
                <Button size="default" variant={"outline"} className="h-7" onClick={() => queueUpdate({updateType: GameUpdateType.FastForward})}>Play - {formattedDate}</Button>
              )
            }
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
