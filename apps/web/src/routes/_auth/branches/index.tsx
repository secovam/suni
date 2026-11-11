import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { z } from "zod";

import { BranchesList } from "@/components/customers/branches/grid";
import { NewEntityButton } from "@/components/customers/new-entity-button";
import { PageHeader } from "@/components/page-header";

/* oxlint-disable promise/prefer-await-to-then, github/no-then -- zod `.catch()` is not Promise.catch */
const searchSchema = z.object({
  name: z.string().default("").catch(""),
  status: z.enum(CUSTOMER_STATUSES).default("all").catch("all"),
  customerId: z.string().default("all").catch("all"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

export const Route = createFileRoute("/_auth/branches/")({
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
        description="Gestiona las sucursales de los clientes"
        icon={Building2}
        title="Sucursales"
        actions={
          <NewEntityButton className="w-full sm:w-auto" entity="branch" />
        }
      />

      <BranchesList
        filters={filters}
        onFiltersChange={(next) => navigate({ search: next, replace: true })}
      />
    </div>
  );
}
