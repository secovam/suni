import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@suni/ui/components/sidebar";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ComponentProps } from "react";

import { NavMain } from "@/components/nav-bar";
import { NavUser } from "@/components/nav-user";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  // On mobile the menu is a sheet over the page; close it once a link navigates.
  useEffect(
    () => router.subscribe("onBeforeNavigate", () => setOpenMobile(false)),
    [router, setOpenMobile]
  );

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-14 group-data-[collapsible=icon]:hidden hover:bg-transparent"
              render={<Link aria-label="Suni, ir al inicio" to="/dashboard" />}
            >
              <img
                alt=""
                className="h-10 w-auto"
                height={75}
                src="/suni-logo.png"
                width={290}
              />
            </SidebarMenuButton>
            <SidebarMenuButton
              className="bg-primary hover:bg-primary hover:text-primary-foreground text-primary-foreground hidden justify-center font-bold group-data-[collapsible=icon]:flex"
              render={<Link aria-label="Suni, ir al inicio" to="/dashboard" />}
              tooltip="Suni"
            >
              S
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
