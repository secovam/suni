import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@suni/ui/components/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { FileText, FolderOpen, HardHat, Info, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { BranchFormDialog } from "@/components/customers/branches/branch-form-dialog";
import { BranchHeader } from "@/components/customers/branches/branch-header";
import { BranchInfoContent } from "@/components/customers/branches/branch-info";
import { branchImageSrc } from "@/components/customers/branches/util/branch-address";
import { ContactsGrid } from "@/components/customers/contacts/contact-grid";
import { archiveState } from "@/components/customers/shared/archive-state";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_auth/customers/$customerId/branches/$branchId/"
)({
  loader: async ({
    context: { queryClient },
    params: { customerId, branchId },
  }) => {
    const branch = await queryClient.query(
      orpc.branches.get.queryOptions({ input: { id: branchId } })
    );

    // A hand-edited URL can pair a branch with another customer.
    if (branch.customerId !== customerId) {
      throw redirect({
        to: "/customers/$customerId/branches/$branchId",
        params: { customerId: branch.customerId, branchId },
        replace: true,
      });
    }
  },
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
  const { branchId } = Route.useParams();
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  // Reads the query cache, not loader data, so saves and archives show up even after a preload.
  const { data: branch } = useSuspenseQuery(
    orpc.branches.get.queryOptions({ input: { id: branchId } })
  );

  const { isArchived } = archiveState(branch);

  const content: Record<(typeof TABS)[number]["value"], ReactNode> = {
    info: (
      <BranchInfoContent
        branch={branch}
        branchImage={branchImageSrc(branch)}
        // eslint-disable-next-line no-empty-function -- pendiente de implementar
        onImagePreview={() => {}}
        // eslint-disable-next-line no-empty-function -- pendiente de implementar
        onImageUpload={() => {}}
      />
    ),
    contacts: (
      <ContactsGrid
        branchId={branchId}
        canCreate={!isArchived}
        customerId={branch.customerId}
      />
    ),
    quotations: null,
    files: null,
    "technical-requirements": null,
  };

  return (
    <div className="flex flex-col gap-6">
      <BranchHeader branch={branch} onEdit={() => setIsUpdateFormOpen(true)} />

      <Tabs defaultValue="info">
        <TabsList className="mb-3 h-auto w-full justify-start">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="mr-2 size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value }) => (
          <TabsContent key={value} value={value}>
            {content[value]}
          </TabsContent>
        ))}
      </Tabs>

      <BranchFormDialog
        branch={branch}
        customerId={branch.customerId}
        onOpenChange={setIsUpdateFormOpen}
        open={isUpdateFormOpen}
      />
    </div>
  );
}
