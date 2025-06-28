import { ObjectiveType } from "@/enums/ObjectiveType";
import { CollectResourceObjective } from "@/models/Objective";
import { ResourceType } from "@/enums/ResourceType";
import EnumSelect from "./enumSelect";
import { ActorStrategy, StrategyCondition, StrategyConditionType } from "@/models/ActorStrategy";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { ItemType } from "@/enums/ItemType";

interface Props {
    strategy: ActorStrategy;
    onStrategyChanged: (strategy: ActorStrategy) => void;
    onDeleted: () => void;
}

export default function StrategyInput({strategy, onStrategyChanged, onDeleted}: Props) {

    const onObjectiveTypeChanged = (objectiveType: ObjectiveType) => {
        switch (objectiveType) {
            case ObjectiveType.CollectResource:
                onStrategyChanged({
                    ...strategy,
                    objective: {
                        objectiveType: ObjectiveType.CollectResource,
                        resourceType: ResourceType.Stick,
                    }
                });
                break;
            case ObjectiveType.CraftItem:
                onStrategyChanged({
                    ...strategy,
                    objective: {
                        objectiveType: ObjectiveType.CraftItem,
                    }
                });
                break;
            case ObjectiveType.BuildStructure:
                onStrategyChanged({
                    ...strategy,
                    objective: {
                        objectiveType: ObjectiveType.BuildStructure,
                    }
                });
                break;
            default:
                console.error("Unknown objective type:", objectiveType);
                break;
        }
    }

    const onResourceTypeChanged = (currentObjective: CollectResourceObjective, resourceType: ResourceType) => {
        const updatedObjective: CollectResourceObjective = {
            ...currentObjective,
            resourceType: resourceType,
        };

        const updatedStrategy: ActorStrategy = {
            ...strategy,
            objective: updatedObjective,
        };

        onStrategyChanged(updatedStrategy);
    }

    const onConditionTypeChanged = (index: number, conditionType: StrategyConditionType) => {
        switch (conditionType) {
            case StrategyConditionType.HungerLessThan:
                onConditionChanged(index, {
                    conditionType: StrategyConditionType.HungerLessThan,
                    hungerLessThan: 0,
                });
                break;
            case StrategyConditionType.ThirstLessThan:
                onConditionChanged(index, {
                    conditionType: StrategyConditionType.ThirstLessThan,
                    thirstLessThan: 0,
                });
                break;
            case StrategyConditionType.ItemQuantityLessThan:
                onConditionChanged(index, {
                    conditionType: StrategyConditionType.ItemQuantityLessThan,
                    itemType: ItemType.Stick,
                    quantity: 0,
                });
                break;
            default:
                console.error("Unknown condition type:", conditionType);
                break;
        }
    }

    const onConditionChanged = (index: number, updatedCondition: StrategyCondition) => {
        const updatedStrategy: ActorStrategy = {
            ...strategy,
            conditions: strategy.conditions.map((condition, i) => i === index ? updatedCondition : condition),
        }

        onStrategyChanged(updatedStrategy);
    }

    const collectResourceObjective = strategy.objective.objectiveType == ObjectiveType.CollectResource ? strategy.objective : undefined

    return (
        <div className="grid gap-4">
            {strategy.conditions.map((condition, index) => (
                <Card className="bg-slate-200">
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <EnumSelect 
                                enumObject={StrategyConditionType} 
                                value={condition.conditionType} 
                                onChanged={conditionType =>  onConditionTypeChanged(index, conditionType)} 
                                valueName="Condition"
                                className="col-span-3 w-full"
                            />
                            <Button className="col-span-1" variant="destructive" onClick={() => onStrategyChanged({...strategy, conditions: strategy.conditions.filter((_, i) => i !== index)})}>
                                -
                            </Button>
                            {condition.conditionType == StrategyConditionType.HungerLessThan && (
                                <Input 
                                    type="number"
                                    placeholder="Hunger Less Than" 
                                    className="col-span-4"
                                    value={condition.hungerLessThan} 
                                    onChange={e => onConditionChanged(index, {...condition, hungerLessThan: parseFloat(e.target.value)})}
                                />
                            )}
                            {condition.conditionType == StrategyConditionType.ThirstLessThan && (
                                <Input 
                                    type="number"
                                    placeholder="Thirst Less Than" 
                                    className="col-span-4"
                                    value={condition.thirstLessThan} 
                                    onChange={e => onConditionChanged(index, {...condition, thirstLessThan: parseFloat(e.target.value)})}
                                />
                            )}
                            {condition.conditionType == StrategyConditionType.ItemQuantityLessThan && (
                                <>
                                    <EnumSelect 
                                        enumObject={ItemType} 
                                        value={condition.itemType} 
                                        onChanged={itemType => onConditionChanged(index, {...condition, itemType})} 
                                        valueName="Item Type" 
                                        className="col-span-4 w-full"
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Quantity Less Than" 
                                        className="col-span-4"
                                        value={condition.quantity} 
                                        onChange={e => onConditionChanged(index, {...condition, quantity: parseInt(e.target.value)})}
                                    />
                                </>
                            )}
                            
                        </div>
                    </CardContent>
                </Card>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
                <Button variant="outline" className="col-span-4" onClick={() => onStrategyChanged({...strategy, conditions: [...strategy.conditions, {
                    conditionType: StrategyConditionType.HungerLessThan,
                    hungerLessThan: 0,
                }]})}>
                    Add Condition
                </Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                    Objective
                </Label>
                <EnumSelect 
                    enumObject={ObjectiveType} 
                    value={strategy.objective.objectiveType} 
                    onChanged={onObjectiveTypeChanged} 
                    valueName="Objective" 
                    className="col-span-3 w-full"
                />
            </div>
            {collectResourceObjective && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                        Resource Type
                    </Label>
                    <EnumSelect 
                        enumObject={ResourceType} 
                        value={collectResourceObjective.resourceType} 
                        onChanged={resourceType => onResourceTypeChanged(collectResourceObjective, resourceType)} 
                        valueName="Resource Type" 
                        className="col-span-3 w-full"
                    />
                </div>
            )}
            <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={onDeleted}>
                    Delete Strategy
                </Button>
            </div>
        </div>
    )
}