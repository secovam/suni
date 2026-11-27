import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Contact,
  ContactRound,
  DollarSign,
  FlaskConical,
  Home,
  Truck,
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

export const HOME_LINK: NavLink = {
  to: "/dashboard",
  label: "Inicio",
  icon: Home,
};

/** The modules, listed below Inicio in the sidebar. */
export const NAV_ENTRIES: NavEntry[] = [
  { to: "/users", label: "Usuarios", icon: Users, adminOnly: true },
  {
    to: "/purchases",
    label: "Órdenes de compra",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    label: "Ventas",
    icon: DollarSign,
    items: [
      { to: "/customers", label: "Clientes", icon: ContactRound },
      { to: "/branches", label: "Sucursales", icon: Building2 },
      { to: "/contacts", label: "Contactos", icon: Contact },
    ],
  },
  {
    label: "Administración",
    icon: BriefcaseBusiness,
    items: [
      { to: "/suppliers", label: "Proveedores", icon: Truck },
      {
        to: "/ingredients",
        label: "Ingredientes",
        icon: FlaskConical,
      },
    ],
  },
];

export function isSection(entry: NavEntry): entry is NavSection {
  return "items" in entry;
}
