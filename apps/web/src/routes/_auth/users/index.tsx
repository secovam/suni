import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
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
        actions={<CreateUserDialog />}
      />
      <UsersDataTable currentUserId={session.user.id} />
    </div>
  );
}
