import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@suni/ui/components/breadcrumb";
import type { LinkProps } from "@tanstack/react-router";
import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment } from "react";

import { NAV_ENTRIES, isSection } from "@/components/nav-items";

const SEGMENT_LABELS = {
  dashboard: "Inicio",
  users: "Usuarios",
  new: "Nuevo",
  edit: "Editar",
  customers: "Clientes",
  branches: "Sucursales",
  contacts: "Contactos",
} satisfies Record<string, string>;

type KnownSegment = keyof typeof SEGMENT_LABELS;

// Only these segments name a page when nested; others (like a customer's branches) have no route of their own.
const NESTED_SEGMENTS = new Set<string>(["new", "edit"]);

const SECTION_BY_PATH = new Map<string, string>();

for (const entry of NAV_ENTRIES) {
  if (isSection(entry)) {
    for (const item of entry.items) {
      SECTION_BY_PATH.set(item.to, entry.label);
    }
  }
}

function isKnownSegment(segment: string): segment is KnownSegment {
  return Object.hasOwn(SEGMENT_LABELS, segment);
}

interface Crumb {
  // A section like "Ventas" groups pages in the sidebar but has no page itself.
  path?: LinkProps["to"];
  label: string;
}

function getCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [
    { path: "/dashboard", label: SEGMENT_LABELS.dashboard },
  ];

  const section = SECTION_BY_PATH.get(`/${segments[0]}`);

  if (section) {
    crumbs.push({ label: section });
  }

  for (const [index, segment] of segments.entries()) {
    const named =
      index === 0 ? segment !== "dashboard" : NESTED_SEGMENTS.has(segment);

    if (named && isKnownSegment(segment)) {
      crumbs.push({
        // SAFETY: solo los segmentos listados en SEGMENT_LABELS llegan aquí
        path: `/${segments.slice(0, index + 1).join("/")}` as LinkProps["to"],
        label: SEGMENT_LABELS[segment],
      });
    }
  }

  return crumbs;
}

function CrumbLabel({
  crumb,
  isCurrent,
}: {
  crumb: Crumb;
  isCurrent: boolean;
}) {
  if (isCurrent) {
    return <BreadcrumbPage>{crumb.label}</BreadcrumbPage>;
  }

  if (!crumb.path) {
    return <span>{crumb.label}</span>;
  }

  return (
    <BreadcrumbLink render={<Link to={crumb.path} />}>
      {crumb.label}
    </BreadcrumbLink>
  );
}

export function DynamicBreadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = getCrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.path ?? crumb.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <CrumbLabel crumb={crumb} isCurrent={crumb.path === pathname} />
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
