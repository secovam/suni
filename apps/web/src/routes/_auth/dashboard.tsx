import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

import { NAV_ENTRIES, isSection } from "@/components/nav-items";
import type { NavLink } from "@/components/nav-items";
import { PageHeader } from "@/components/page-header";
import { useIsAdmin } from "@/hooks/use-is-admin";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const firstName = Route.useRouteContext({
    select: (ctx) => ctx.session.user.name.split(" ")[0],
  });

  const isAdmin = useIsAdmin();

  const shortcuts: (NavLink & { section?: string })[] = [];

  for (const entry of NAV_ENTRIES) {
    const links = isSection(entry)
      ? entry.items.map((item) => ({ ...item, section: entry.label }))
      : [entry];

    for (const link of links) {
      if (link.to !== "/dashboard" && (isAdmin || !link.adminOnly)) {
        shortcuts.push(link);
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Elige un módulo para empezar"
        icon={Home}
        title={`Hola, ${firstName}`}
      />

      <nav aria-label="Accesos rápidos">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(({ to, label, icon: Icon, section }) => (
            <li key={to}>
              <Link
                className="bg-card hover:border-primary/40 focus-visible:ring-ring group flex items-center gap-4 rounded-xl border p-4 shadow-xs transition-colors outline-none focus-visible:ring-2"
                to={to}
              >
                <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon aria-hidden className="text-primary size-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{label}</span>
                  {section ? (
                    <span className="text-muted-foreground text-xs">
                      {section}
                    </span>
                  ) : null}
                </div>
                <ChevronRight
                  aria-hidden
                  className="text-muted-foreground group-hover:text-primary size-4 transition-colors"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
