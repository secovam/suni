import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@suni/ui/components/breadcrumb";
import type { LinkProps } from "@tanstack/react-router";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
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
  suppliers: "Proveedores",
  ingredients: "Catálogo de ingredientes",
  purchases: "Órdenes de compra",
} satisfies Record<string, string>;

const SECTION_BY_PATH = new Map<string, string>();

for (const entry of NAV_ENTRIES) {
  if (isSection(entry)) {
    for (const item of entry.items) {
      SECTION_BY_PATH.set(item.to, entry.label);
    }
  }
}

function isKnownSegment(
  segment: string
): segment is keyof typeof SEGMENT_LABELS {
  return Object.hasOwn(SEGMENT_LABELS, segment);
}

interface Crumb {
  path?: LinkProps["to"];
  label: string;
  params?: Record<string, string>;
}

function getCrumbs(
  template: string,
  routes: { fullPath: NonNullable<LinkProps["to"]> }[],
  params: Record<string, string>,
  parentId?: string
): Crumb[] {
  const segments = template.split("/").filter(Boolean);

  const crumbs: Crumb[] = [
    { path: "/dashboard", label: SEGMENT_LABELS.dashboard },
  ];

  const section = SECTION_BY_PATH.get(`/${segments[0]}`);

  if (section) {
    crumbs.push({ label: section });
  }

  for (const [index, segment] of segments.entries()) {
    const param = segment.slice(1);

    const staticLabel = isKnownSegment(segment)
      ? SEGMENT_LABELS[segment]
      : undefined;

    const label = segment.startsWith("$") ? params[param] : staticLabel;

    if (!label || segment === "dashboard") {
      continue;
    }

    const prefix = `/${segments.slice(0, index + 1).join("/")}`;

    const path = routes.find(
      ({ fullPath }) => fullPath.replace(/\/$/u, "") === prefix
    )?.fullPath;

    if (parentId && segment.startsWith("$") && index === segments.length - 1) {
      crumbs.push({
        path,
        label: parentId,
        params: { ...params, [param]: parentId },
      });
    }

    crumbs.push({ path, label, params });
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
    <BreadcrumbLink render={<Link params={crumb.params} to={crumb.path} />}>
      {crumb.label}
    </BreadcrumbLink>
  );
}

export function DynamicBreadcrumb() {
  const router = useRouter();
  const match = useRouterState({ select: (state) => state.matches.at(-1) });
  const data = match?.loaderData;

  const parentId =
    data && "breadcrumbParentId" in data ? data.breadcrumbParentId : undefined;

  const crumbs = getCrumbs(
    match?.fullPath ?? "",
    Object.values(router.routesByPath),
    match?.params ?? {},
    parentId
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={`${crumb.path ?? ""}:${crumb.label}`}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <CrumbLabel
                crumb={crumb}
                isCurrent={index === crumbs.length - 1}
              />
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
