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
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
