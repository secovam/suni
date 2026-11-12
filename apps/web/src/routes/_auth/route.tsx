import { Button } from "@suni/ui/components/button";
import { Separator } from "@suni/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@suni/ui/components/sidebar";
import { TooltipProvider } from "@suni/ui/components/tooltip";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { useStopImpersonating } from "@/hooks/use-users";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({
        to: "/",
      });
    }

    return { session };
  },
});

function ImpersonationBanner() {
  const { session } = Route.useRouteContext();
  const stop = useStopImpersonating();

  if (!session.session.impersonatedBy) {
    return null;
  }

  return (
    <div className="bg-muted flex items-center justify-between gap-2 border-b px-4 py-2 text-sm">
      <span>
        Estás viendo la aplicación como <strong>{session.user.name}</strong>.
      </span>
      <Button
        disabled={stop.isPending}
        onClick={() => stop.mutate()}
        size="sm"
        variant="outline"
      >
        Volver a mi cuenta
      </Button>
    </div>
  );
}

function AuthLayout() {
  return (
    <TooltipProvider>
      {/* The sidebar saves its collapsed state in this cookie; read it back so a reload keeps it. */}
      <SidebarProvider
        defaultOpen={!document.cookie.includes("sidebar_state=false")}
      >
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="bg-background/95 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur md:rounded-t-xl">
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              orientation="vertical"
            />
            <DynamicBreadcrumb />
          </header>
          <ImpersonationBanner />
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
