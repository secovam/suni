import { SidebarMenu, SidebarMenuItem } from "@suni/ui/components/sidebar";
import { cn } from "@suni/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Home, Users } from "lucide-react";

interface NavItem {
  to: "/dashboard" | "/users" | "/customers";
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/users", label: "Usuarios", icon: Users },
  { to: "/customers", label: "Clientes", icon: Users },
];

export function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarMenu>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
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
