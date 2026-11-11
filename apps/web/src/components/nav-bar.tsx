import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@suni/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@suni/ui/components/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { NAV_ENTRIES, isSection } from "@/components/nav-items";
import type { NavLink, NavSection } from "@/components/nav-items";
import { useIsAdmin } from "@/hooks/use-is-admin";

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

interface NavSectionItemProps {
  section: NavSection;
  items: NavLink[];
  pathname: string;
}

function NavSectionItem({ section, items, pathname }: NavSectionItemProps) {
  const { isMobile, state, setOpen: setSidebarOpen } = useSidebar();
  const active = items.some((item) => isActive(pathname, item.to));
  const [open, setOpen] = useState(active);
  const [wasActive, setWasActive] = useState(active);

  // Entering one of its pages opens the section; leaving keeps whatever the user chose.
  if (active !== wasActive) {
    setWasActive(active);

    if (active) {
      setOpen(true);
    }
  }

  function handleOpenChange(next: boolean) {
    // Sub-items are hidden while collapsed to icons, so expand the sidebar and the section together.
    if (!isMobile && state === "collapsed") {
      setSidebarOpen(true);
      setOpen(true);

      return;
    }

    setOpen(next);
  }

  const { label, icon: Icon } = section;

  return (
    <Collapsible
      className="group/collapsible"
      onOpenChange={handleOpenChange}
      open={open}
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton isActive={active} tooltip={label} />}
      >
        <Icon />
        <span>{label}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="mt-1">
          {items.map((item) => (
            <SidebarMenuSubItem key={item.to}>
              <SidebarMenuSubButton
                isActive={isActive(pathname, item.to)}
                render={<Link to={item.to} />}
              >
                <span>{item.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = useIsAdmin();
  const canSee = (link: NavLink) => isAdmin || !link.adminOnly;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_ENTRIES.map((entry) => {
          if (!isSection(entry)) {
            if (!canSee(entry)) {
              return null;
            }

            const { to, label, icon: Icon } = entry;

            return (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  isActive={isActive(pathname, to)}
                  render={<Link to={to} />}
                  tooltip={label}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          const items = entry.items.filter(canSee);

          if (items.length === 0) {
            return null;
          }

          return (
            <NavSectionItem
              items={items}
              key={entry.label}
              pathname={pathname}
              section={entry}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
