import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@suni/ui/components/sidebar";
import type { ComponentProps } from "react";

import { NavMain } from "@/components/nav-bar";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-4 py-3 text-sm font-semibold">Suni</div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <NavMain />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-muted-foreground px-4 py-3 text-xs">Footer</div>
      </SidebarFooter>
    </Sidebar>
  );
}
