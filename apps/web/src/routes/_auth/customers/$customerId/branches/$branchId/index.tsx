import { Badge } from "@suni/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@suni/ui/components/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
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
    <p className="text-destructive text-sm">No se pudo cargar la sucursal.</p>
  ),
});

const TABS = [
  { value: "info", label: "Información general" },
  { value: "quotations", label: "Cotizaciones" },
  { value: "files", label: "Archivos" },
  { value: "contacts", label: "Contactos" },
  {
    value: "technical-requirements",
    label: "Requerimientos Técnicos",
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
        <div className="overflow-x-auto">
          <TabsList
            aria-label="Secciones de la sucursal"
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

      <BranchFormDialog
        branch={branch}
        customerId={branch.customerId}
        onOpenChange={setIsUpdateFormOpen}
        open={isUpdateFormOpen}
      />
    </div>
  );
}
