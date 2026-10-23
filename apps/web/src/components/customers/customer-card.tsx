import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Badge } from "@suni/ui/components/badge";
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
  Archive,
  ArchiveRestore,
  ChevronRight,
  MapPin,
  MoreVertical,
  Pencil,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { ChangeCustomerStatusDialog } from "./change-customer-status-dialog";

type CustomerRow = AppRouterOutputs["customers"]["list"][number];

interface CustomerCardProps {
  customer: CustomerRow;
  isAdmin?: boolean;
  seller?: { name: string } | null;
}

export default function CustomerCard({
  customer,
  isAdmin = false,
  seller,
}: CustomerCardProps) {
  const isArchived = !!customer.archived;
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group bg-card relative flex h-full flex-col overflow-hidden rounded-xl border transition-colors duration-200",
          isArchived
            ? "border-border/60 bg-archived-pattern shadow-sm"
            : "border-border hover:border-success/30 hover:shadow-md"
        )}
      >
        <div className="border-muted border-b p-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              className="min-w-0 flex-1"
              params={{ customerId: customer.id }}
              to="/customers/$customerId"
            >
              <h2
                className={cn(
                  "line-clamp-2 text-lg leading-tight font-semibold transition-colors hover:underline",
                  isArchived ? "text-muted-foreground" : "text-success"
                )}
              >
                {customer.name}
              </h2>
            </Link>

            <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="icon-sm" variant="ghost" />}
                >
                  <span className="sr-only">Abrir menú</span>
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    {!isArchived && (
                      <DropdownMenuItem
                        render={
                          <Link
                            params={{ customerId: customer.id }}
                            to="/customers/$customerId/edit"
                          />
                        }
                      >
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setIsStatusDialogOpen(true)}
                    >
                      {isArchived ? (
                        <ArchiveRestore className="mr-2 size-4" />
                      ) : (
                        <Archive className="mr-2 size-4" />
                      )}
                      {isArchived ? "Desarchivar" : "Archivar"}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </div>
        </div>

        <div className="flex grow flex-col p-5">
          {/* RFC */}
          <div>
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
              {customer.rfc}
            </span>
          </div>

          {/* Seller */}
          {isAdmin && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <UserRound className="text-muted-foreground/70 size-4 shrink-0" />
              <span className="text-muted-foreground/70">Vendedor:</span>
              <span className="text-muted-foreground">
                {seller?.name ?? "—"}
              </span>
            </div>
          )}

          {/* Address */}
          <div className="mt-4 flex-1">
            <div className="flex items-start gap-2">
              <MapPin className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
              <div className="text-muted-foreground flex flex-col text-sm leading-relaxed">
                <span className="line-clamp-1">
                  {customer.suburb && `${customer.suburb}, `}
                  {customer.city}
                </span>
                <span className="text-muted-foreground/70 text-xs">
                  {customer.state}
                  {customer.postalCode && ` · CP ${customer.postalCode}`}
                </span>
              </div>
            </div>
          </div>

          {/* Archived badge */}
          {isArchived && (
            <div className="mt-3">
              <Badge variant="secondary">
                <Archive className="size-3" />
                Archivado
              </Badge>
            </div>
          )}
        </div>

        {/* View details footer */}
        <Link params={{ customerId: customer.id }} to="/customers/$customerId">
          <div className="border-border bg-card group-hover:bg-muted/30 flex items-center justify-between border-t px-4 py-3 transition-colors">
            <span className="text-muted-foreground text-sm font-medium">
              Ver detalles
            </span>
            <ChevronRight className="text-muted-foreground/70 group-hover:text-success size-4 transition-colors" />
          </div>
        </Link>
      </div>

      <ChangeCustomerStatusDialog
        customer={customer}
        onOpenChange={setIsStatusDialogOpen}
        open={isStatusDialogOpen}
      />
    </>
  );
}
