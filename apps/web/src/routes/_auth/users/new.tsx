import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";

import { UserForm } from "@/components/users/user-form";

export const Route = createFileRoute("/_auth/users/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <User className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Nuevo Usuario</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Crea un nuevo usuario para el sistema
          </p>
        </div>
      </div>
      <UserForm />
    </div>
  );
}
