import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Button } from "@suni/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@suni/ui/components/dropdown-menu";
import { cn } from "@suni/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
} from "lucide-react";

import { ArchiveMenuItem } from "@/components/customers/shared/archive-menu-item";
import { ArchivedFooter } from "@/components/customers/shared/archived-footer";

interface SupplierCardProps {
  supplier: AppRouterOutputs["suppliers"]["list"][number];
  onChangeStatus?: () => void;
}

export function SupplierCard({ supplier, onChangeStatus }: SupplierCardProps) {
  const isArchived = !!supplier.archived;
  const params = { supplierId: supplier.id };

  return (
    <div
      className={cn(
        "group bg-card relative flex h-full flex-col overflow-hidden rounded-xl border transition-colors duration-200",
        isArchived
          ? "border-border bg-muted/30"
          : "border-border hover:border-primary/30 hover:shadow-md"
      )}
    >
      <div className="border-muted border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            className="min-w-0 flex-1"
            params={params}
            to="/suppliers/$supplierId"
          >
            <h2
              className={cn(
                "line-clamp-2 text-lg leading-tight font-semibold transition-colors hover:underline",
                isArchived
                  ? "text-muted-foreground decoration-muted-foreground/50 underline underline-offset-4"
                  : "text-primary"
              )}
            >
              {supplier.name}
              {isArchived ? <span className="sr-only">, Archivado</span> : null}
            </h2>
          </Link>

          {onChangeStatus ? (
            <span className="shrink-0 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-within:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="icon-sm" variant="ghost" />}
                >
                  <span className="sr-only">Acciones de {supplier.name}</span>
                  <MoreVertical aria-hidden className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    {isArchived ? null : (
                      <DropdownMenuItem
                        render={
                          <Link
                            params={params}
                            to="/suppliers/$supplierId/edit"
                          />
                        }
                      >
                        <Pencil aria-hidden className="mr-2 size-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <ArchiveMenuItem
                      isOwnArchived={isArchived}
                      onClick={onChangeStatus}
                    />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex grow flex-col p-5">
        <div>
          <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
            {supplier.rfc}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <MapPin
            aria-hidden
            className="text-muted-foreground/70 mt-0.5 size-4 shrink-0"
          />
          <div className="text-muted-foreground flex flex-col text-sm leading-relaxed">
            <span className="line-clamp-1">
              {supplier.suburb}, {supplier.city}
            </span>
            <span className="text-muted-foreground/70 text-xs">
              {supplier.state} · CP {supplier.postalCode}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground mt-3 flex items-start gap-2 text-sm tabular-nums">
          <Phone
            aria-hidden
            className="text-muted-foreground/70 mt-0.5 size-4 shrink-0"
          />
          <span>
            {supplier.phone}
            {supplier.phoneExtension && ` ext. ${supplier.phoneExtension}`}
          </span>
        </div>
      </div>

      {isArchived ? (
        <ArchivedFooter
          label="Archivado"
          name={supplier.name}
          onUnarchive={onChangeStatus}
        />
      ) : (
        <Link params={params} to="/suppliers/$supplierId">
          <div className="border-border bg-card group-hover:bg-muted/30 flex items-center justify-between border-t px-4 py-3 transition-colors">
            <span className="text-muted-foreground text-sm font-medium">
              Ver detalles
            </span>
            <ChevronRight
              aria-hidden
              className="text-muted-foreground/70 group-hover:text-primary size-4 transition-colors"
            />
          </div>
        </Link>
      )}
    </div>
  );
}
