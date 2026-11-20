import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@suni/ui/components/tabs";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Pencil, Truck } from "lucide-react";
import { useRef, useState } from "react";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { PageHeader } from "@/components/page-header";
import { SupplierData } from "@/components/suppliers/supplier-data";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  supplierQueryOptions,
  useGetSupplier,
  useSetSupplierArchived,
} from "@/hooks/use-suppliers";

export const Route = createFileRoute("/_auth/suppliers/$supplierId/")({
  loader: ({ context: { queryClient }, params: { supplierId } }) =>
    queryClient.query(supplierQueryOptions(supplierId)),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm" role="alert">
      No se pudo cargar el proveedor.
    </p>
  ),
});

const UPCOMING_TABS = [
  { value: "catalog", label: "Catálogo de productos" },
  { value: "quotes", label: "Cotizaciones" },
  { value: "files", label: "Documentos Fiscales" },
  { value: "orders", label: "Órdenes de Compra" },
  { value: "billing-portal", label: "Portal de facturación" },
] as const;

function RouteComponent() {
  const { supplierId } = Route.useParams();
  const { data: supplier } = useGetSupplier(supplierId);
  const isAdmin = useIsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusButton = useRef<HTMLButtonElement>(null);
  const archive = useSetSupplierArchived();
  const isArchived = !!supplier.archived;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          isAdmin ? (
            <>
              {isArchived ? null : (
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      params={{ supplierId }}
                      to="/suppliers/$supplierId/edit"
                    />
                  }
                >
                  <Pencil aria-hidden />
                  Editar
                </Button>
              )}
              <Button
                onClick={() => setDialogOpen(true)}
                ref={statusButton}
                variant="outline"
              >
                {isArchived ? (
                  <ArchiveRestore aria-hidden />
                ) : (
                  <Archive aria-hidden />
                )}
                {isArchived ? "Desarchivar" : "Archivar"}
              </Button>
            </>
          ) : undefined
        }
        description={
          <div className="flex items-center gap-2">
            <span className="tabular-nums">RFC {supplier.rfc}</span>
            {isArchived ? <Badge variant="secondary">Archivado</Badge> : null}
          </div>
        }
        icon={Truck}
        title={supplier.name}
      />
      <Tabs defaultValue="general">
        <div className="overflow-x-auto">
          <TabsList
            aria-label="Secciones del proveedor"
            className="w-max min-w-full"
          >
            <TabsTrigger value="general">Datos generales</TabsTrigger>
            {UPCOMING_TABS.map(({ value, label }) => (
              <TabsTrigger disabled key={value} value={value}>
                {label}
                <Badge variant="secondary">Pronto</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="general">
          <SupplierData supplier={supplier} />
        </TabsContent>
      </Tabs>
      {isAdmin ? (
        <ChangeStatusDialog
          entity={supplier}
          finalFocus={statusButton}
          mutation={archive}
          noun="al proveedor"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
        />
      ) : null}
    </div>
  );
}
