import {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
} from "@suni/db/schema/customer-enums";
import { Button } from "@suni/ui/components/button";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { ContactRound, Plus } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import CustomerFilters from "@/components/customers/customer-filters";
import CustomerList from "@/components/customers/customer-list";
import { useListCustomers } from "@/hooks/use-customers";
import { stripAccents } from "@/lib/string-utils";

/* oxlint-disable promise/prefer-await-to-then, github/no-then */
const searchSchema = z.object({
  name: z.string().default("").catch(""),
  type: z
    .enum(["all", ...CUSTOMER_TYPES])
    .default("all")
    .catch("all"),
  status: z.enum(CUSTOMER_STATUSES).default("active").catch("active"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

const defaultFilters = searchSchema.parse({});

export const Route = createFileRoute("/_auth/customers/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultFilters)] },
  component: RouteComponent,
});

function RouteComponent() {
  const { name, type, status } = Route.useSearch();

  const {
    data: customers = [],
    isError,
    isPending,
  } = useListCustomers({ status });

  const matchingName = useMemo(() => {
    const term = stripAccents(name.trim()).toLowerCase();

    return customers
      .filter((customer) =>
        stripAccents(customer.name).toLowerCase().includes(term)
      )
      .toSorted((a, b) => a.name.localeCompare(b.name, "es"));
  }, [customers, name]);

  const visibleCustomers =
    type === "all"
      ? matchingName
      : matchingName.filter((customer) => customer.type === type);

  const hasFilters =
    name.trim() !== "" || type !== "all" || status !== defaultFilters.status;

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

      <CustomerFilters customers={matchingName} hasFilters={hasFilters} />

      <CustomerList
        customers={visibleCustomers}
        hasFilters={hasFilters}
        isError={isError}
        isPending={isPending}
      />
    </div>
  );
}
