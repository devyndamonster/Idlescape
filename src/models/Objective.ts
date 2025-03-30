import { ObjectiveType } from "@/enums/ObjectiveType";
import { ResourceType } from "@/enums/ResourceType";

export type Objective = CollectResourceObjective | CraftItemObjective | BuildStructureObjective;

export type CollectResourceObjective = {
    objectiveType: ObjectiveType.CollectResource;
    resourceType: ResourceType;
}

export type CraftItemObjective = {
    objectiveType: ObjectiveType.CraftItem;
}

export type BuildStructureObjective = {
    objectiveType: ObjectiveType.BuildStructure;
}