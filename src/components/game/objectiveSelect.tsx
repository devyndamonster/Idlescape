import { ObjectiveType } from "@/enums/ObjectiveType";
import { Objective } from "@/models/Objective";
import { ResourceType } from "@/enums/ResourceType";
import EnumSelect from "./enumSelect";

interface Props {
    currentObjective: Objective;
    onObjectiveChanged: (objective: Objective) => void;
}

export default function ObjectiveSelect({onObjectiveChanged, currentObjective}: Props) {

    const onObjectiveTypeChanged = (objectiveType: ObjectiveType) => {
        switch (objectiveType) {
            case ObjectiveType.CollectResource:
                onObjectiveChanged({
                    objectiveType: ObjectiveType.CollectResource,
                    resourceType: ResourceType.Stick,
                });
                break;
            case ObjectiveType.CraftItem:
                onObjectiveChanged({
                    objectiveType: ObjectiveType.CraftItem,
                });
                break;
            case ObjectiveType.BuildStructure:
                onObjectiveChanged({
                    objectiveType: ObjectiveType.BuildStructure,
                });
                break;
            default:
                console.error("Unknown objective type:", objectiveType);
                break;
        }
    }

    const onResourceTypeChanged = (resourceType: ResourceType) => {
        const updatedObjective = {
            ...currentObjective,
            resourceType: resourceType,
        };
        onObjectiveChanged(updatedObjective);
    }

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <EnumSelect enumObject={ObjectiveType} value={currentObjective.objectiveType} onChanged={onObjectiveTypeChanged} valueName="Objective" />
            </div>
            {currentObjective.objectiveType == ObjectiveType.CollectResource && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <EnumSelect enumObject={ResourceType} value={currentObjective.resourceType} onChanged={onResourceTypeChanged} valueName="Resource Type" />
                </div>
            )}
        </div>
    )
}