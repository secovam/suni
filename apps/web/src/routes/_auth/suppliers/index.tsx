import type { AppRouterOutputs } from "@suni/api/routers/index";
import { supplierListSchema } from "@suni/db/validation/suppliers";
import { Button } from "@suni/ui/components/button";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { Plus, Truck } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { EntityGrid } from "@/components/customers/shared/entity-grid";
import {
  byStatus,
  countByStatus,
  matchingName,
} from "@/components/customers/shared/filters";
import { StatusTabs } from "@/components/customers/shared/status-tabs";
import { PageHeader } from "@/components/page-header";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { SupplierFilters } from "@/components/suppliers/supplier-filters";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  useListSuppliers,
  useSetSupplierArchived,
} from "@/hooks/use-suppliers";

/* oxlint-disable promise/prefer-await-to-then, github/no-then -- zod `.catch()` is not Promise.catch */
const searchSchema = supplierListSchema.extend({
  name: z.string().default("").catch(""),
  status: supplierListSchema.shape.status.catch("active"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

const defaultFilters = searchSchema.parse({});

const LIST_COPY = {
  loading: "Cargando proveedores",
  error: "No se pudieron cargar los proveedores",
  notFound: "No se encontraron proveedores",
  empty: "No hay proveedores para mostrar",
  emptyHint: "Los proveedores aparecerán aquí",
};

export const Route = createFileRoute("/_auth/suppliers/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultFilters)] },
  component: RouteComponent,
});

function RouteComponent() {
  const { name, status } = Route.useSearch();
  const navigate = Route.useNavigate();
  const isAdmin = useIsAdmin();
  const query = useListSuppliers({ status: "all" });
  const rowsByStatus = byStatus(matchingName(query.data ?? [], name));
  const suppliers = rowsByStatus[status];
  const archive = useSetSupplierArchived();
  const filtersRef = useRef<HTMLDivElement>(null);

  const [target, setTarget] =
    useState<AppRouterOutputs["suppliers"]["list"][number]>();

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          isAdmin ? (
            <Button nativeButton={false} render={<Link to="/suppliers/new" />}>
              <Plus aria-hidden />
              Nuevo proveedor
            </Button>
          ) : undefined
        }
        description="Consulta el directorio de proveedores"
        icon={Truck}
        title="Proveedores"
      />
      <StatusTabs
        counts={query.data ? countByStatus(rowsByStatus) : undefined}
        onValueChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, status: next }),
            replace: true,
          })
        }
        value={status}
      >
        <div ref={filtersRef} tabIndex={-1}>
          <SupplierFilters />
        </div>
        <EntityGrid
          copy={LIST_COPY}
          hasFilters={name.trim() !== ""}
          icon={Truck}
          isEmpty={suppliers.length === 0}
          query={query}
        >
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              onChangeStatus={
                isAdmin
                  ? () => {
                      setTarget(supplier);
                      setDialogOpen(true);
                    }
                  : undefined
              }
              supplier={supplier}
            />
          ))}
        </EntityGrid>
      </StatusTabs>
      {isAdmin && target ? (
        <ChangeStatusDialog
          entity={target}
          finalFocus={filtersRef}
          mutation={archive}
          noun="al proveedor"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
        />
      ) : null}
    </div>
  );
}
