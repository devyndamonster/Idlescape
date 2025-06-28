import { GameState, getActors } from "@/models/GameState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Actor } from "@/models/entities/Actor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ItemType } from "@/enums/ItemType";
import { ActorStrategy } from "@/models/ActorStrategy";
import StrategyInput from "./stategyInput";
import { ObjectiveType } from "@/enums/ObjectiveType";
import { ResourceType } from "@/enums/ResourceType";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card, CardContent } from "../ui/card";

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

    const onStrategiesChanged = (strategies: ActorStrategy[]) => {
        const updatedActor: Actor = {...selectedActor, strategies: strategies};
        onActorUpdated(updatedActor);
    }

    return (
        <Dialog modal={true} open={selectedActor != undefined} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-3">
                <DialogHeader>
                    <DialogTitle>Actor</DialogTitle>
                    <DialogDescription>
                        You are viewing the details of an actor
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] rounded-md overflow-y-auto">
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
                                        <Label htmlFor="actor-health" className="text-right">
                                            Health
                                        </Label>
                                        <Progress id="actor-health" value={(selectedActor.health / selectedActor.maxHealth) * 100} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="actor-hunger" className="text-right">
                                            Hunger
                                        </Label>
                                        <Progress id="actor-hunger" value={selectedActor.hunger * 100} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="actor-thirst" className="text-right">
                                            Thirst
                                        </Label>
                                        <Progress id="actor-thirst" value={selectedActor.thirst * 100} className="col-span-3" />
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
                            <AccordionTrigger>Objectives</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4">
                                    {selectedActor.strategies.map((strategy, index) => (
                                        <Card className="bg-slate-100">
                                            <CardContent>
                                                <StrategyInput 
                                                    onStrategyChanged={updatedStrategy => onStrategiesChanged(selectedActor.strategies.map((strategy, i) => i === index ? updatedStrategy : strategy))} 
                                                    onDeleted={() => onStrategiesChanged(selectedActor.strategies.filter((_, i) => i !== index))}
                                                    strategy={strategy} 
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        className="mt-4 w-full" 
                                        onClick={() => onStrategiesChanged([...selectedActor.strategies, { conditions: [], objective: { objectiveType: ObjectiveType.CollectResource, resourceType: ResourceType.Stick } }])}>
                                        Add Strategy
                                    </Button>
                                </div>
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
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}