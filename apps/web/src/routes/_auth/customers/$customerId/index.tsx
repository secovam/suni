import { buttonVariants } from "@suni/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@suni/ui/components/tabs";
import { cn } from "@suni/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ContactRound,
  FileText,
  FolderOpen,
  KeyRound,
  MapPin,
  ShoppingCart,
  Users,
} from "lucide-react";

import { CustomerData } from "@/components/customers/data";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/customers/$customerId/")({
  loader: ({ context: { queryClient }, params: { customerId } }) =>
    queryClient.query(
      orpc.customers.get.queryOptions({ input: { id: customerId } })
    ),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive p-6 text-sm">
      No se pudo cargar el cliente.
    </p>
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

  return (
    <div className="flex flex-col">
      <div className="from-muted/60 to-muted/20 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-brand/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <ContactRound className="text-brand h-4.5 w-4.5" />
            </div>
            <h1 className="text-brand text-xl font-bold">{customer.name}</h1>
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
        {customer.archived ? null : (
          <Link
            className={buttonVariants({ variant: "green" })}
            params={{ customerId: customer.id }}
            to="/customers/$customerId/edit"
          >
            Editar
          </Link>
        )}
      </div>

      <CustomerData customer={customer} />

      <Tabs className="mt-6" defaultValue="branches">
        <TabsList className="mb-3 h-auto w-full justify-start">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="mr-2 size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
