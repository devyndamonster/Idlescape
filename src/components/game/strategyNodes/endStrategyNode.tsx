import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import EnumSelect from "../enumSelect";
import { Objective } from "@/models/Objective";
import { ObjectiveType } from "@/enums/ObjectiveType";
import { ResourceType } from "@/enums/ResourceType";
import { useGameData } from "@/game/GameContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemType } from "@/enums/ItemType";

export function EndStrategyNode() {
    const gameData = useGameData();

    const [objective, setObjective] = useState<Objective>({
        objectiveType: ObjectiveType.CollectResource,
        resourceType: ResourceType.BlueberryBush
    });

    const onObjectiveTypeChanged = (objectiveType: ObjectiveType) => {
        setObjective((prev) => {
            switch (objectiveType) {
                case ObjectiveType.CollectResource:
                    return { objectiveType, resourceType: ResourceType.BlueberryBush };
                case ObjectiveType.CraftItem:
                    return { objectiveType, craftingRecipeId: 1 }; // Default to some recipe ID
                case ObjectiveType.BuildStructure:
                    return { objectiveType };
                default:
                    return prev;
            }
        });
    }

    return (
        <div className="border-2 rounded-sm p-5 bg-white">
            <div className="flex flex-row gap-2">
                <EnumSelect
                    enumObject={ObjectiveType}
                    value={objective.objectiveType}
                    onChanged={onObjectiveTypeChanged}
                    valueName="Objective Type"
                    className="w-[150px]"
                />
                {objective.objectiveType == ObjectiveType.CollectResource && (
                    <EnumSelect
                        enumObject={ResourceType}
                        value={objective.resourceType}
                        onChanged={(resourceType: ResourceType) => setObjective({ ...objective, resourceType })}
                        valueName="Resource Type"
                        className="w-[150px]"
                    />
                )}
                {objective.objectiveType == ObjectiveType.CraftItem && (
                    <Select value={objective.craftingRecipeId.toString()} onValueChange={(value) => setObjective({ ...objective, craftingRecipeId: Number(value) })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Recipe" />
                        </SelectTrigger>
                        <SelectContent>
                            {gameData.craftingRecipes.map(recipe => (
                                <SelectItem key={recipe.recipeId} value={recipe.recipeId.toString()}>{`${ItemType[recipe.resultItemType]} x ${recipe.resultQuantity}`}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            <Handle type="target" position={Position.Top} />
        </div>
    );
}