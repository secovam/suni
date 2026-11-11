import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@suni/ui/components/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, ContactRound, Pencil } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { BranchesGrid } from "@/components/customers/branches/grid";
import { ChangeCustomerStatusDialog } from "@/components/customers/change-customer-status-dialog";
import { ContactsGrid } from "@/components/customers/contacts/contact-grid";
import { CustomerData } from "@/components/customers/data";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/date-utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/customers/$customerId/")({
  loader: ({ context: { queryClient }, params: { customerId } }) =>
    queryClient.query(
      orpc.customers.get.queryOptions({ input: { id: customerId } })
    ),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm">No se pudo cargar el cliente.</p>
  ),
});

const TABS = [
  { value: "branches", label: "Sucursales" },
  { value: "contacts", label: "Contactos" },
  { value: "quotes", label: "Cotizaciones" },
  { value: "files", label: "Documentos Fiscales" },
  { value: "orders", label: "Órdenes de Compra" },
  { value: "billing-portal", label: "Portal de facturación" },
] as const;

function RouteComponent() {
  const { customerId } = Route.useParams();

  // Reads the query cache, not loader data, so saves and archives show up even after a preload.
  const { data: customer } = useSuspenseQuery(
    orpc.customers.get.queryOptions({ input: { id: customerId } })
  );

  const isArchived = !!customer.archived;
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const content: Record<(typeof TABS)[number]["value"], ReactNode> = {
    branches: <BranchesGrid canCreate={!isArchived} customerId={customer.id} />,
    contacts: <ContactsGrid canCreate={!isArchived} customerId={customer.id} />,
    quotes: null,
    files: null,
    orders: null,
    "billing-portal": null,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          <>
            {isArchived ? null : (
              <Button
                nativeButton={false}
                render={
                  <Link
                    params={{ customerId: customer.id }}
                    to="/customers/$customerId/edit"
                  />
                }
              >
                <Pencil aria-hidden />
                Editar
              </Button>
            )}
            <Button
              onClick={() => setIsStatusDialogOpen(true)}
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
        }
        description={
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular-nums">{customer.rfc}</span>
            <Badge variant={customer.type === "Asesor" ? "outline" : "default"}>
              {customer.type}
            </Badge>
            <span>Actualizado {formatDate(customer.updatedAt)}</span>
          </div>
        }
        icon={ContactRound}
        title={customer.name}
      />

      <ChangeCustomerStatusDialog
        customer={customer}
        onOpenChange={setIsStatusDialogOpen}
        open={isStatusDialogOpen}
      />

      {isArchived ? (
        <p className="bg-muted text-muted-foreground flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
          <Archive aria-hidden className="size-4 shrink-0" />
          Este cliente está archivado. Desarchívalo para editarlo o agregarle
          sucursales y contactos.
        </p>
      ) : null}

      <CustomerData customer={customer} />

      <Tabs defaultValue="branches">
        {/* Six tabs don't fit a phone; scroll them instead of widening the page. */}
        <div className="overflow-x-auto">
          <TabsList
            aria-label="Secciones del cliente"
            className="w-max min-w-full"
          >
            {TABS.map(({ value, label }) => (
              // Tabs without content yet stay visible but disabled, so the roadmap shows without dead ends.
              <TabsTrigger
                disabled={content[value] === null}
                key={value}
                value={value}
              >
                {label}
                {content[value] === null ? (
                  <Badge variant="secondary">Pronto</Badge>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {TABS.map(({ value }) => (
          <TabsContent key={value} value={value}>
            {content[value]}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
