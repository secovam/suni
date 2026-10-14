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

const SEGMENT_LABELS = {
  dashboard: "Inicio",
  users: "Usuarios",
  new: "Nuevo",
  edit: "Editar",
} satisfies Record<string, string>;

type KnownSegment = keyof typeof SEGMENT_LABELS;

function isKnownSegment(segment: string): segment is KnownSegment {
  return Object.hasOwn(SEGMENT_LABELS, segment);
}

interface Crumb {
  path: LinkProps["to"];
  label: string;
}

function getCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [
    { path: "/dashboard", label: SEGMENT_LABELS.dashboard },
  ];

  for (const [index, segment] of segments.entries()) {
    if (segment === "dashboard" && index === 0) {
      continue;
    }

    if (isKnownSegment(segment)) {
      crumbs.push({
        // SAFETY: solo los segmentos listados en SEGMENT_LABELS llegan aquí
        path: `/${segments.slice(0, index + 1).join("/")}` as LinkProps["to"],
        label: SEGMENT_LABELS[segment],
      });
    }
  }

  return crumbs;
}

export function DynamicBreadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = getCrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={crumb.path} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
