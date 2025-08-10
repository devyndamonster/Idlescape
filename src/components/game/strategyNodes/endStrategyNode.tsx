import { Handle, NodeProps, Position } from "@xyflow/react";
import EnumSelect from "../enumSelect";
import { BuildStructureObjective, CollectResourceObjective, CraftItemObjective, Objective } from "@/models/Objective";
import { ObjectiveType } from "@/enums/ObjectiveType";
import { ResourceType } from "@/enums/ResourceType";
import { useGameData } from "@/game/GameContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemType } from "@/enums/ItemType";
import { EndStrategyNodeType } from "@/state/types";
import useStore from "@/state/store";
import { match } from "ts-pattern";

export function EndStrategyNode({ id, data }: NodeProps<EndStrategyNodeType>) {
    const gameData = useGameData();

    const objective = data.objective;
    const updateObjective = useStore((state) => state.updateObjective);

    const onObjectiveTypeChanged = (objectiveType: ObjectiveType) => {
        const updatedObjective: Objective = match(objectiveType)
            .with(ObjectiveType.CollectResource, (): CollectResourceObjective => ({ objectiveType: ObjectiveType.CollectResource, resourceType: ResourceType.BlueberryBush }))
            .with(ObjectiveType.CraftItem, (): CraftItemObjective => ({ objectiveType: ObjectiveType.CraftItem, craftingRecipeId: 1 }))
            .with(ObjectiveType.BuildStructure, (): BuildStructureObjective => ({ objectiveType: ObjectiveType.BuildStructure }))
            .otherwise(() => data.objective);

        updateObjective(id, updatedObjective);
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
                        onChanged={(resourceType: ResourceType) => updateObjective(id, {...objective, resourceType})}
                        valueName="Resource Type"
                        className="w-[150px]"
                    />
                )}
                {objective.objectiveType == ObjectiveType.CraftItem && (
                    <Select value={objective.craftingRecipeId.toString()} onValueChange={(value) => updateObjective(id, { ...objective, craftingRecipeId: Number(value) })}>
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