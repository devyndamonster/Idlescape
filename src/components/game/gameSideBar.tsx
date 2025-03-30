import { HousePlus, Leaf, Trash2, TreePine, Warehouse } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "../ui/sidebar";
import { CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Collapsible } from "@radix-ui/react-collapsible";
import { UserAction } from "@/enums/UserAction";

interface Props {
    onResetWorld: () => void;
    onUserActionStarted: (userAction: UserAction) => void;
}

export function GameSideBar({onResetWorld, onUserActionStarted}: Props) {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Game</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton asChild>
                                            <a href={"#"}>
                                                <HousePlus />Build
                                            </a>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton onClick={() => onUserActionStarted(UserAction.BuildStockpile)} asChild>
                                                    <a href={"#"}>
                                                        <Warehouse /> Stockpile
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                            <Collapsible className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton asChild>
                                            <a href={"#"}>
                                                <HousePlus />Plant
                                            </a>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton onClick={() => onUserActionStarted(UserAction.PlantTreeSeed)} asChild>
                                                    <a href={"#"}>
                                                        <TreePine /> Plant Tree
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton onClick={() => onUserActionStarted(UserAction.PlantGrassSeed)} asChild>
                                                    <a href={"#"}>
                                                        <Leaf /> Plant Grass
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={onResetWorld} asChild>
                                    <a href={"#"}>
                                        <Trash2 />
                                        <span>Reset World</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
  }