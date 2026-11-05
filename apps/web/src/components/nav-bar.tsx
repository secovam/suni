import { SidebarMenu, SidebarMenuItem } from "@suni/ui/components/sidebar";
import { cn } from "@suni/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Home, Users } from "lucide-react";

import { useIsAdmin } from "@/hooks/use-is-admin";

interface NavItem {
  to: "/dashboard" | "/users" | "/customers";
  label: string;
  icon: LucideIcon;
  adminOnly?: true;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/users", label: "Usuarios", icon: Users, adminOnly: true },
  { to: "/customers", label: "Clientes", icon: Users },
];

export function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = useIsAdmin();
  const items = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);

  return (
    <SidebarMenu>
      {items.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);

        return (
          <SidebarMenuItem key={to}>
            <Link
              to={to}
              className={cn(
                "flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors",
                "hover:bg-brand [&_svg]:size-4 [&_svg]:shrink-0",
                active && "bg-brand font-medium text-white"
              )}
            >
              <Icon className={cn(active && "text-success")} />
              <span>{label}</span>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
