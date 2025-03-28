import { GameState } from "@/models/GameState";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Objective } from "@/enums/Objective";
import { Actor } from "@/models/Actor";

interface Props {
    gameState: GameState;
    selectedActorUuid: string | null;
    onClose: () => void;
    onActorUpdated: (actor: Actor) => void;
}

export default function CharacterDialog({gameState, selectedActorUuid, onClose, onActorUpdated}: Props) {

    const selectedActor = gameState.actors.find(actor => actor.uuid === selectedActorUuid);
    
    if(selectedActor == undefined){
        return null;
    }

    const objectiveMapping: Record<string, Objective> = Object
        .values(Objective)
        .filter(value => typeof value === "number")
        .reduce((acc: Record<string, Objective>, value) => {
            acc[Objective[value]] = value;
            return acc;
        }, {});

    const onObjectiveChange = (objective: string) => {
        const updatedActor: Actor = {...selectedActor, currentObjective: objectiveMapping[objective]};
        onActorUpdated(updatedActor);
    }

    return (
        <Dialog open={selectedActor != undefined} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Actor</DialogTitle>
                    <DialogDescription>
                        You are viewing the details of an actor
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actor-objective" className="text-right">
                            Objective
                        </Label>
                        <Select value={Objective[selectedActor.currentObjective]} onValueChange={onObjectiveChange}>
                            <SelectTrigger id="actor-objective" className="col-span-3 w-full">
                                <SelectValue placeholder="Select an objective" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Objectives</SelectLabel>
                                    {Object.keys(objectiveMapping).map(objective => (
                                        <SelectItem key={objective} value={objective}>{objective}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actor-id" className="text-right">
                            Username
                        </Label>
                        <Input disabled id="actor-id" value={selectedActor.uuid} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actor-harvest-progress" className="text-right">
                            Harvest Progress
                        </Label>
                        <Progress id="actor-harvest-progress" value={selectedActor.harvestProgress * 100} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="col-span-4">
                            Inventory
                        </Label>
                        <div className="col-span-4" >
                            <Table >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedActor?.inventory
                                        .filter(slot => slot.item)
                                        .map((slot, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{slot.item?.name}</TableCell>
                                                <TableCell>{slot.quantity}</TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}