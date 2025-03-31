import { BuildableType } from "@/enums/BuildableType";
import { UserActionType } from "@/enums/UserAction";

export type UserAction = BuildAction;

export type BuildAction = {
    actionType: UserActionType.Build;
    buildableType: BuildableType;
}