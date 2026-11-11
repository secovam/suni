import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Contact,
  ContactRound,
  DollarSign,
  Home,
  Users,
} from "lucide-react";

export interface NavLink {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  icon: LucideIcon;
  adminOnly?: true;
}

export interface NavSection {
  label: string;
  icon: LucideIcon;
  items: NavLink[];
}

type NavEntry = NavLink | NavSection;

export const NAV_ENTRIES: NavEntry[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/users", label: "Usuarios", icon: Users, adminOnly: true },
  {
    label: "Ventas",
    icon: DollarSign,
    items: [
      { to: "/customers", label: "Clientes", icon: ContactRound },
      { to: "/branches", label: "Sucursales", icon: Building2 },
      { to: "/contacts", label: "Contactos", icon: Contact },
    ],
  },
];

export function isSection(entry: NavEntry): entry is NavSection {
  return "items" in entry;
}
