import {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
} from "@suni/db/schema/customer-enums";
import { Button } from "@suni/ui/components/button";
import { cn } from "@suni/ui/lib/utils";
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
import { PageHeader } from "@/components/page-header";
import { useListCustomers } from "@/hooks/use-customers";
import { stripAccents } from "@/lib/string-utils";

/* oxlint-disable promise/prefer-await-to-then, github/no-then -- zod `.catch()` is not Promise.catch */
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
    isPlaceholderData,
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
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Gestiona los clientes del sistema"
        icon={ContactRound}
        title="Clientes"
        actions={
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link to="/customers/new" />}
            variant="green"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        }
      />

      <CustomerFilters customers={matchingName} hasFilters={hasFilters} />

      {/* Placeholder data is the previous filter's list; dim it until the new one arrives. */}
      <div
        aria-busy={isPlaceholderData}
        className={cn(
          "transition-opacity",
          isPlaceholderData && "pointer-events-none opacity-50"
        )}
      >
        <CustomerList
          customers={visibleCustomers}
          hasFilters={hasFilters}
          isError={isError}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
