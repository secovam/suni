import { Badge } from "@suni/ui/components/badge";
import { Button, buttonVariants } from "@suni/ui/components/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@suni/ui/components/tabs";
import { cn } from "@suni/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  ContactRound,
  FileText,
  FolderOpen,
  KeyRound,
  MapPin,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useState } from "react";

import { BranchesGrid } from "@/components/customers/branches/grid";
import { ChangeCustomerStatusDialog } from "@/components/customers/change-customer-status-dialog";
import { ContactsGrid } from "@/components/customers/contacts/contact-grid";
import { CustomerData } from "@/components/customers/data";
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
  { value: "branches", label: "Sucursales", icon: MapPin },
  { value: "contacts", label: "Contactos", icon: Users },
  { value: "quotes", label: "Cotizaciones", icon: FileText },
  { value: "files", label: "Documentos Fiscales", icon: FolderOpen },
  { value: "orders", label: "Órdenes de Compra", icon: ShoppingCart },
  { value: "billing-portal", label: "Portal de facturación", icon: KeyRound },
] as const;

function RouteComponent() {
  const { customerId } = Route.useParams();

  // Reads the query cache, not loader data, so saves and archives show up even after a preload.
  const { data: customer } = useSuspenseQuery(
    orpc.customers.get.queryOptions({ input: { id: customerId } })
  );

  const isArchived = !!customer.archived;
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-xl border px-5 py-4",
          isArchived
            ? "border-border/60 bg-muted/40"
            : "from-muted/60 to-muted/20 bg-linear-to-r"
        )}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isArchived ? "bg-muted" : "bg-brand/10"
              )}
            >
              <ContactRound
                className={cn(
                  "h-4.5 w-4.5",
                  isArchived ? "text-muted-foreground" : "text-brand"
                )}
              />
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <h1
                className={cn(
                  "truncate text-xl font-bold",
                  isArchived ? "text-muted-foreground" : "text-brand"
                )}
              >
                {customer.name}
              </h1>
              {isArchived ? (
                <Badge className="shrink-0" variant="secondary">
                  <Archive className="size-3" />
                  Archivado
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-muted-foreground text-sm">{customer.rfc}</p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                customer.type === "Asesor"
                  ? "bg-muted text-foreground"
                  : "bg-brand/10 text-brand"
              )}
            >
              {customer.type}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isArchived ? null : (
            <Link
              className={buttonVariants({ variant: "green" })}
              params={{ customerId: customer.id }}
              to="/customers/$customerId/edit"
            >
              Editar
            </Link>
          )}
          <Button onClick={() => setIsStatusDialogOpen(true)} variant="outline">
            {isArchived ? (
              <ArchiveRestore className="size-3.5" />
            ) : (
              <Archive className="size-3.5" />
            )}
            {isArchived ? "Desarchivar" : "Archivar"}
          </Button>
        </div>
      </div>

      <ChangeCustomerStatusDialog
        customer={customer}
        onOpenChange={setIsStatusDialogOpen}
        open={isStatusDialogOpen}
      />

      <CustomerData customer={customer} />

      <Tabs className="mt-6" defaultValue="branches">
        {/* Six tabs don't fit a phone; scroll them instead of widening the page. */}
        <div className="mb-3 overflow-x-auto">
          <TabsList className="h-auto w-max min-w-full justify-start">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="mr-2 size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="branches">
          <BranchesGrid
            canCreate={!customer.archived}
            customerId={customer.id}
          />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsGrid
            canCreate={!customer.archived}
            customerId={customer.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
