import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/users/user-form";

export const Route = createFileRoute("/_auth/users/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Crea un nuevo usuario para el sistema"
        icon={User}
        title="Nuevo Usuario"
      />
      <UserForm />
    </div>
  );
}
