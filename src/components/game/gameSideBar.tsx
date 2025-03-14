import { Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface Props {
    onResetWorld: () => void;
}

export function GameSideBar({onResetWorld}: Props) {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href={"#"}>
                                        <Settings />
                                        <span>Settings</span>
                                    </a>
                                </SidebarMenuButton>
                                <SidebarMenuButton onClick={onResetWorld} asChild>
                                    <span>
                                        <Settings /> Reset World
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
  }