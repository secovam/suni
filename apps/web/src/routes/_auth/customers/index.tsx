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
import {
  byStatus,
  countByStatus,
  matchingName,
} from "@/components/customers/shared/filters";
import { StatusTabs } from "@/components/customers/shared/status-tabs";
import { PageHeader } from "@/components/page-header";
import { useListCustomers } from "@/hooks/use-customers";

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
  const navigate = Route.useNavigate();

  // Fetch every status once so each tab shows its count and switching is instant.
  const {
    data: customers,
    isError,
    isPending,
  } = useListCustomers({ status: "all" });

  const rowsByStatus = useMemo(
    () => byStatus(matchingName(customers ?? [], name)),
    [customers, name]
  );

  const inTab = rowsByStatus[status];

  const visibleCustomers =
    type === "all" ? inTab : inTab.filter((customer) => customer.type === type);

  const hasFilters = name.trim() !== "" || type !== "all";

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
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        }
      />

      <StatusTabs
        counts={customers ? countByStatus(rowsByStatus) : undefined}
        onValueChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, status: next }),
            replace: true,
          })
        }
        value={status}
      >
        <CustomerFilters customers={inTab} />
        <CustomerList
          customers={visibleCustomers}
          hasFilters={hasFilters}
          isError={isError}
          isPending={isPending}
        />
      </StatusTabs>
    </div>
  );
}
