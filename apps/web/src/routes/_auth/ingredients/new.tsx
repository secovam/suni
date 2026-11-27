import { createFileRoute, redirect } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";

import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_auth/ingredients/new")({
  beforeLoad: ({ context }) => {
    if (context.session.user.role !== "admin") {
      throw redirect({ to: "/ingredients" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Registra un ingrediente en el catálogo"
        icon={FlaskConical}
        title="Nuevo ingrediente"
      />
      <IngredientForm />
    </div>
  );
}
