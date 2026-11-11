import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { z } from "zod";

import { ContactsList } from "@/components/customers/contacts/contact-grid";
import { NewEntityButton } from "@/components/customers/new-entity-button";

/* oxlint-disable promise/prefer-await-to-then, github/no-then -- zod `.catch()` is not Promise.catch */
const searchSchema = z.object({
  name: z.string().default("").catch(""),
  status: z.enum(CUSTOMER_STATUSES).default("all").catch("all"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

export const Route = createFileRoute("/_auth/contacts/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(searchSchema.parse({}))] },
  component: RouteComponent,
});

function RouteComponent() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Users className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Contactos</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Gestiona los contactos de las sucursales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewEntityButton className="w-full sm:w-auto" entity="contact" />
        </div>
      </div>

      <ContactsList
        filters={filters}
        onFiltersChange={(next) => navigate({ search: next, replace: true })}
      />
    </div>
  );
}
