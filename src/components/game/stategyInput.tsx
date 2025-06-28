import { ObjectiveType } from "@/enums/ObjectiveType";
import { CollectResourceObjective, Objective } from "@/models/Objective";
import { ResourceType } from "@/enums/ResourceType";
import EnumSelect from "./enumSelect";
import { ActorStrategy, StrategyCondition } from "@/models/ActorStrategy";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Props {
    strategy: ActorStrategy;
    onStrategyChanged: (strategy: ActorStrategy) => void;
}

export default function StrategyInput({strategy, onStrategyChanged}: Props) {

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

    const onConditionChanged = (index: number, updatedCondition: StrategyCondition) => {
        const updatedStrategy: ActorStrategy = {
            ...strategy,
            conditions: strategy.conditions.map((condition, i) => i === index ? updatedCondition : condition),
        }

        onStrategyChanged(updatedStrategy);
    }

    const collectResourceObjective = strategy.objective.objectiveType == ObjectiveType.CollectResource ? strategy.objective : undefined

    return (
        <div className="grid gap-4 py-4">
            {strategy.conditions.map((condition, index) => (
                <div className="grid grid-cols-4 items-center gap-4">
                    {condition.hungerLessThan !== undefined ? (
                        <>
                            <Input
                                type="number"
                                value={condition.hungerLessThan}
                                onChange={(e) => onConditionChanged(index, {...condition, hungerLessThan: parseInt(e.target.value)})}
                                placeholder="Hunger Less Than"
                                className="col-span-3"
                            />
                            <Button variant="outline" onClick={() => onConditionChanged(index, {...condition, hungerLessThan: undefined})}>-</Button>
                        </>
                    ) : (
                        <Button variant="outline" className="col-span-4" onClick={() => onConditionChanged(index, {...condition, hungerLessThan: 0})}>Add Hunger Condition</Button>
                    )}
                </div>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
                <Button variant="outline" className="col-span-4" onClick={() => onStrategyChanged({...strategy, conditions: [...strategy.conditions, {}]})}>
                    Add Condition
                </Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <EnumSelect enumObject={ObjectiveType} value={strategy.objective.objectiveType} onChanged={onObjectiveTypeChanged} valueName="Objective" />
            </div>
            {collectResourceObjective && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <EnumSelect enumObject={ResourceType} value={collectResourceObjective.resourceType} onChanged={resourceType => onResourceTypeChanged(collectResourceObjective, resourceType)} valueName="Resource Type" />
                </div>
            )}
        </div>
    )
}