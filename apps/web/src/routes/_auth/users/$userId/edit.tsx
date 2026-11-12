import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserPen } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/users/user-form";

export const Route = createFileRoute("/_auth/users/$userId/edit")({
  loader: ({ context: { orpc, queryClient }, params: { userId } }) =>
    queryClient.query(orpc.users.get.queryOptions({ input: { id: userId } })),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm">No se pudo cargar el usuario.</p>
  ),
});

function RouteComponent() {
  const user = Route.useLoaderData();
  const navigate = useNavigate();
  const goToUsers = () => navigate({ to: "/users" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Modifica la información del usuario"
        icon={UserPen}
        title="Editar Usuario"
      />

      <UserForm onCancel={goToUsers} onSuccess={goToUsers} user={user} />
    </div>
  );
}
