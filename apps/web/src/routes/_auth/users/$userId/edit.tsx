import { createFileRoute } from "@tanstack/react-router";
import { Loader2, UserPen } from "lucide-react";

import { FormUser } from "@/components/users/user-form";
import { useGetUser } from "@/hooks/use-users";

export const Route = createFileRoute("/_auth/users/$userId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const { data: user, isPending, isError } = useGetUser(userId);

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (isError || !user) {
      return (
        <p className="text-destructive text-sm">
          No se pudo cargar el usuario.
        </p>
      );
    }

    return <FormUser key={user.id} user={user} />;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <UserPen className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Editar Usuario</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Modifica la información del usuario
          </p>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
