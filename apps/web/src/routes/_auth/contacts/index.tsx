import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { z } from "zod";

import { ContactsList } from "@/components/customers/contacts/contact-grid";
import { NewEntityButton } from "@/components/customers/new-entity-button";
import { PageHeader } from "@/components/page-header";

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
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Gestiona los contactos de las sucursales"
        icon={Users}
        title="Contactos"
        actions={
          <NewEntityButton className="w-full sm:w-auto" entity="contact" />
        }
      />

      <ContactsList
        filters={filters}
        onFiltersChange={(next) => navigate({ search: next, replace: true })}
      />
    </div>
  );
}
