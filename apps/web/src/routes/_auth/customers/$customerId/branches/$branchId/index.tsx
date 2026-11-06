import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@suni/ui/components/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderOpen, HardHat, Info, Users } from "lucide-react";
import { useState } from "react";

import { BranchFormDialog } from "@/components/customers/branches/branch-form-dialog";
import { BranchHeader } from "@/components/customers/branches/branch-header";
import { BranchInfoContent } from "@/components/customers/branches/branch-info";
import { ContactsGrid } from "@/components/customers/contacts/contact-grid";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_auth/customers/$customerId/branches/$branchId/"
)({
  loader: ({ context: { queryClient }, params: { customerId, branchId } }) =>
    Promise.all([
      queryClient.query(
        orpc.branches.get.queryOptions({ input: { id: branchId } })
      ),
      queryClient.query(
        orpc.customers.get.queryOptions({ input: { id: customerId } })
      ),
    ]),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive p-6 text-sm">
      No se pudo cargar la sucursal.
    </p>
  ),
});

const TABS = [
  { value: "info", label: "Información general", icon: Info },
  { value: "quotations", label: "Cotizaciones", icon: FileText },
  { value: "files", label: "Archivos", icon: FolderOpen },
  { value: "contacts", label: "Contactos", icon: Users },
  {
    value: "technical-requirements",
    label: "Requerimientos Técnicos",
    icon: HardHat,
  },
] as const;

function RouteComponent() {
  const { customerId, branchId } = Route.useParams();
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  // Lee el caché de queries (no el loader) para que ediciones y archivados se reflejen.
  const { data: branch } = useSuspenseQuery(
    orpc.branches.get.queryOptions({ input: { id: branchId } })
  );

  const { data: customer } = useSuspenseQuery(
    orpc.customers.get.queryOptions({ input: { id: customerId } })
  );

  const placeholder = "/placeholder.webp";
  const branchImage = branch.frontImageUrl ?? placeholder;

  return (
    <div className="flex flex-col gap-6">
      <BranchHeader
        branch={branch}
        customerName={customer.name}
        onEdit={() => setIsUpdateFormOpen(true)}
      />

      <Tabs defaultValue="info">
        <TabsList className="mb-3 h-auto w-full justify-start">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="mr-2 size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="info">
          <BranchInfoContent
            branch={branch}
            branchImage={branchImage}
            // eslint-disable-next-line no-empty-function
            onImagePreview={() => {}}
            // eslint-disable-next-line no-empty-function
            onImageUpload={() => {}}
          />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsGrid branchId={branchId} customerId={customer.id} />
        </TabsContent>

        {TABS.map(({ value }) => (
          <TabsContent key={value} value={value} />
        ))}
      </Tabs>

      <BranchFormDialog
        branch={branch}
        customerId={customer.id}
        onOpenChange={setIsUpdateFormOpen}
        open={isUpdateFormOpen}
      />
    </div>
  );
}
