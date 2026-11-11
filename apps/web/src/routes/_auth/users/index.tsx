import { Button } from "@suni/ui/components/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { UsersDataTable } from "@/components/users/users-table";

export const Route = createFileRoute("/_auth/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Administra los usuarios del sistema"
        icon={Users}
        title="Usuarios"
        actions={
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link to="/users/new" />}
            variant="green"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        }
      />
      <UsersDataTable currentUserId={session.user.id} />
    </div>
  );
}
