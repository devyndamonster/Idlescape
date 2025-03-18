import { GameState } from "@/models/GameState";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface Props {
    gameState: GameState;
    selectedActorUuid: string | null;
    onClose: () => void;
}

export default function CharacterDialog({gameState, selectedActorUuid, onClose}: Props) {

    const selectedActor = gameState.actors.find(actor => actor.uuid === selectedActorUuid);
    
    return (
        <Dialog open={selectedActor != undefined} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Actor</DialogTitle>
                    <DialogDescription>
                        You are viewing the details of an actor
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                    <span>Id: {selectedActor?.uuid}</span>
                    <span>Harvest Progress: {selectedActor?.harvestProgress.toFixed(2)}</span>
                </div>
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}