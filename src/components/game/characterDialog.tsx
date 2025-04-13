import { GameState, getActors } from "@/models/GameState";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Actor } from "@/models/entities/Actor";
import { Objective } from "@/models/Objective";
import ObjectiveSelect from "./objectiveSelect";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ItemType } from "@/enums/ItemType";

interface Props {
    gameState: GameState;
    selectedActorUuid: string | null;
    onClose: () => void;
    onActorUpdated: (actor: Actor) => void;
}

export default function CharacterDialog({gameState, selectedActorUuid, onClose, onActorUpdated}: Props) {

    const selectedActor = getActors(gameState).find(actor => actor.uuid === selectedActorUuid);
    
    if(selectedActor == undefined){
        return null;
    }

    const onObjectiveChange = (objective: Objective) => {
        const updatedActor: Actor = {...selectedActor, currentObjective: objective};
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
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Actor Details</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="actor-id" className="text-right">
                                        Actor Id
                                    </Label>
                                    <Input disabled id="actor-id" value={selectedActor.uuid} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="actor-harvest-progress" className="text-right">
                                        Harvest Progress
                                    </Label>
                                    <Progress id="actor-harvest-progress" value={selectedActor.harvestProgress * 100} className="col-span-3" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Objective</AccordionTrigger>
                        <AccordionContent>
                            <ObjectiveSelect onObjectiveChanged={onObjectiveChange} currentObjective={selectedActor.currentObjective} />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Inventory</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
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
                                                            <TableCell>{ItemType[slot.item!.itemType]}</TableCell>
                                                            <TableCell>{slot.quantity}</TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}