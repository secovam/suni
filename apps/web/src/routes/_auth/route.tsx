import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@suni/ui/components/sidebar";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({
        to: "/",
      });
    }

    return { session };
  },
});

function AuthLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <DynamicBreadcrumb />
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
