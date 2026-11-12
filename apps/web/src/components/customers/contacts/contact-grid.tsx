import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { NewEntityButton } from "@/components/customers/new-entity-button";
import { EntityGrid } from "@/components/customers/shared/entity-grid";
import {
  DEFAULT_CONTACT_FILTERS,
  byStatus,
  countByStatus,
  matchingName,
} from "@/components/customers/shared/filters";
import type {
  ContactFilters,
  StatusFilter,
} from "@/components/customers/shared/filters";
import {
  StatusSegmented,
  StatusTabs,
} from "@/components/customers/shared/status-tabs";
import { useListContacts } from "@/hooks/use-contacts";

import ContactCard from "./contact-card";
import { ContactsFilters } from "./contact-filters";

interface ContactsListProps {
  action?: ReactNode;
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  /** Scopes the list to one customer and hides the customer on each card. */
  customerId?: string;
  branchId?: string;
}

export function ContactsList({
  filters,
  onFiltersChange,
  action,
  customerId,
  branchId,
}: ContactsListProps) {
  const query = useListContacts({
    status: "all",
    customerId,
    branchId,
  });

  const rowsByStatus = useMemo(
    () => byStatus(matchingName(query.data ?? [], filters.name)),
    [query.data, filters.name]
  );

  const visibleContacts = rowsByStatus[filters.status];

  const hasFilters = filters.name.trim() !== "";

  const statusProps = {
    counts: query.data ? countByStatus(rowsByStatus) : undefined,
    onValueChange: (status: StatusFilter) =>
      onFiltersChange({ ...filters, status }),
    value: filters.status,
  };

  // Inside the customer or branch detail the page already has tabs, so the status is a segmented control.
  const isNested = customerId !== undefined;

  const list = (
    <>
      <ContactsFilters
        action={action}
        filters={filters}
        onFiltersChange={onFiltersChange}
      >
        {isNested ? <StatusSegmented {...statusProps} /> : null}
      </ContactsFilters>

      <EntityGrid
        copy={{
          loading: "Cargando contactos…",
          error: "No se pudieron cargar los contactos.",
          notFound: "No se encontraron contactos",
          empty: "No hay contactos para mostrar",
          emptyHint: "Los contactos aparecerán aquí",
        }}
        hasFilters={hasFilters}
        icon={Users}
        isEmpty={visibleContacts.length === 0}
        query={query}
      >
        {visibleContacts.map((contact) => (
          <ContactCard
            contact={contact}
            customer={customerId ? undefined : (contact.customer ?? undefined)}
            key={contact.id}
          />
        ))}
      </EntityGrid>
    </>
  );

  if (isNested) {
    return list;
  }

  return <StatusTabs {...statusProps}>{list}</StatusTabs>;
}

interface ContactsGridProps {
  customerId: string;
  branchId?: string;
  canCreate: boolean;
}

export function ContactsGrid({
  customerId,
  branchId,
  canCreate,
}: ContactsGridProps) {
  // An archived parent archives everything under it, so "Activos" would always be empty.
  const [filters, setFilters] = useState<ContactFilters>({
    ...DEFAULT_CONTACT_FILTERS,
    status: canCreate ? "active" : "all",
  });

  return (
    <div className="flex min-w-full flex-col gap-4">
      <ContactsList
        action={
          canCreate ? (
            <NewEntityButton
              branchId={branchId}
              customerId={customerId}
              entity="contact"
            />
          ) : null
        }
        branchId={branchId}
        customerId={customerId}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
