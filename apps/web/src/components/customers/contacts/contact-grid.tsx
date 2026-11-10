import { SearchX, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { NewEntityButton } from "@/components/customers/select-entity-button";
import { useListContacts } from "@/hooks/use-contacts";

import ContactCard from "./contact-card";
import { ContactsFilters } from "./contact-filters";
import type { ContactFilters } from "./contact-filters";

interface ContactsGridProps {
  customerId: string;
  branchId?: string;
}

const DEFAULT_CONTACT_FILTERS: ContactFilters = {
  name: "",
  status: "all",
};

export function ContactsGrid({ customerId, branchId }: ContactsGridProps) {
  const [filters, setFilters] = useState<ContactFilters>(
    DEFAULT_CONTACT_FILTERS
  );

  const {
    data: contacts = [],
    isPending,
    isError,
  } = useListContacts({ customerId, branchId });

  const filtered = useMemo(() => {
    const term = filters.name.trim().toLowerCase();

    return contacts.filter((contact) => {
      if (term && !contact.name.toLowerCase().includes(term)) {
        return false;
      }

      if (filters.status === "active") {
        return !contact.archived;
      }

      if (filters.status === "archived") {
        return !!contact.archived;
      }

      return true;
    });
  }, [contacts, filters]);

  const hasActiveFilters =
    filters.name.trim() !== "" || filters.status !== "all";

  return (
    <div className="flex min-w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-lg font-semibold">Contactos</h2>
        <NewEntityButton
          branchId={branchId}
          customerId={customerId}
          entity="contact"
        />
      </div>

      <ContactsFilters filters={filters} onFiltersChange={setFilters} />

      {isPending ? (
        <p className="text-muted-foreground p-8 text-center text-sm">
          Cargando contactos…
        </p>
      ) : null}

      {isError ? (
        <p className="text-destructive p-8 text-center text-sm">
          No se pudieron cargar los contactos.
        </p>
      ) : null}

      {!(isPending || isError) && filtered.length === 0 ? (
        <div className="flex min-h-70 flex-col items-center justify-center p-8 text-center">
          {hasActiveFilters ? (
            <SearchX
              className="text-muted-foreground/70 mb-4 size-12"
              strokeWidth={1}
            />
          ) : (
            <Users
              className="text-muted-foreground/70 mb-4 size-12"
              strokeWidth={1}
            />
          )}
          <p className="text-muted-foreground text-sm font-medium">
            {hasActiveFilters
              ? "No se encontraron contactos"
              : "No hay contactos para mostrar"}
          </p>
          <p className="text-muted-foreground/70 mt-1 text-xs">
            {hasActiveFilters
              ? "Intenta con otros filtros de búsqueda"
              : "Los contactos aparecerán aquí"}
          </p>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((contact) => (
            <ContactCard contact={contact} key={contact.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
