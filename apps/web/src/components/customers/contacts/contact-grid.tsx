import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { NewEntityButton } from "@/components/customers/new-entity-button";
import { EntityGrid } from "@/components/customers/shared/entity-grid";
import {
  DEFAULT_CONTACT_FILTERS,
  matchingName,
} from "@/components/customers/shared/filters";
import type { ContactFilters } from "@/components/customers/shared/filters";
import { useListContacts } from "@/hooks/use-contacts";

import ContactCard from "./contact-card";
import { ContactsFilters } from "./contact-filters";

interface ContactsListProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  /** Scopes the list to one customer and hides the customer on each card. */
  customerId?: string;
  branchId?: string;
}

export function ContactsList({
  filters,
  onFiltersChange,
  customerId,
  branchId,
}: ContactsListProps) {
  const query = useListContacts({
    status: filters.status,
    customerId,
    branchId,
  });

  const visibleContacts = useMemo(
    () => matchingName(query.data ?? [], filters.name),
    [query.data, filters.name]
  );

  const hasFilters =
    filters.name.trim() !== "" ||
    filters.status !== DEFAULT_CONTACT_FILTERS.status;

  return (
    <>
      <ContactsFilters
        filters={filters}
        hasFilters={hasFilters}
        onFiltersChange={onFiltersChange}
      />

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
  const [filters, setFilters] = useState(DEFAULT_CONTACT_FILTERS);

  return (
    <div className="flex min-w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-lg font-semibold">Contactos</h2>
        {canCreate ? (
          <NewEntityButton
            branchId={branchId}
            customerId={customerId}
            entity="contact"
          />
        ) : null}
      </div>

      <ContactsList
        branchId={branchId}
        customerId={customerId}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
