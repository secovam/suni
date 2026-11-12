import { cn } from "@suni/ui/lib/utils";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { SearchX, Users } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import ContactCard from "@/components/customers/contacts/contact-card";
import { ContactsFilters } from "@/components/customers/contacts/contact-filters";
import type { ContactFilters } from "@/components/customers/contacts/contact-filters";
import { NewEntityButton } from "@/components/customers/select-entity-button";
import { useListContacts } from "@/hooks/use-contacts";
import { stripAccents } from "@/lib/string-utils";

/* oxlint-disable promise/prefer-await-to-then, github/no-then -- zod `.catch()` is not Promise.catch */
const searchSchema = z.object({
  name: z.string().default("").catch(""),
  status: z.enum(["all", "active", "archived"]).default("all").catch("all"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

const defaultFilters = searchSchema.parse({});

export const Route = createFileRoute("/_auth/contacts/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultFilters)] },
  component: RouteComponent,
});

function RouteComponent() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();

  const {
    data: contacts = [],
    isError,
    isPending,
    isPlaceholderData,
  } = useListContacts({ status: filters.status });

  const visibleContacts = useMemo(() => {
    const term = stripAccents(filters.name.trim()).toLowerCase();

    return contacts
      .filter(
        (contact) =>
          !term || stripAccents(contact.name).toLowerCase().includes(term)
      )
      .toSorted((a, b) => a.name.localeCompare(b.name, "es"));
  }, [contacts, filters.name]);

  const hasFilters =
    filters.name.trim() !== "" || filters.status !== defaultFilters.status;

  const handleFiltersChange = (next: ContactFilters) =>
    navigate({ search: next, replace: true });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Users className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Contactos</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Gestiona los contactos de las sucursales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewEntityButton className="w-full sm:w-auto" entity="contact" />
        </div>
      </div>

      <ContactsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

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

      {!(isPending || isError) && visibleContacts.length === 0 ? (
        <div className="flex min-h-70 flex-col items-center justify-center p-8 text-center">
          {hasFilters ? (
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
            {hasFilters
              ? "No se encontraron contactos"
              : "No hay contactos para mostrar"}
          </p>
          <p className="text-muted-foreground/70 mt-1 text-xs">
            {hasFilters
              ? "Intenta con otros filtros de búsqueda"
              : "Los contactos aparecerán aquí"}
          </p>
        </div>
      ) : null}

      {visibleContacts.length > 0 ? (
        <div
          aria-busy={isPlaceholderData}
          className={cn(
            "grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2",
            isPlaceholderData && "pointer-events-none opacity-50"
          )}
        >
          {visibleContacts.map((contact) => (
            <ContactCard contact={contact} key={contact.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
