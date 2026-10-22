import { Button } from "@suni/ui/components/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ContactRound, Plus } from "lucide-react";

export const Route = createFileRoute("/_auth/customers/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <ContactRound className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Clientes</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Gestiona los clientes del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link to="/customers/new" />}
            variant="green"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>
    </div>
  );
}
