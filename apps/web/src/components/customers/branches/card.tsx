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
  Building2,
  ChevronRight,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
} from "lucide-react";
import { useState } from "react";

import { BranchFormDialog } from "./branch-form-dialog";
import { ChangeBranchStatusDialog } from "./change-branch-status-dialog";
import { branchImageSrc, formatAddress } from "./util/branch-address";
import type { Branch } from "./util/branch-address";

interface BranchCardProps {
  branch: Branch;
  customer?: { id: string; name: string };
}

interface BranchImageProps {
  name: string;
  src: string;
  isArchived: boolean;
}

function BranchImage({ name, src, isArchived }: BranchImageProps) {
  return (
    <div
      className={cn(
        "group/image relative h-48 w-full overflow-hidden",
        isArchived && "grayscale"
      )}
    >
      <img
        alt={name}
        className="size-full object-cover transition-transform duration-500 group-hover/image:scale-105"
        src={src}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      {isArchived && (
        <Badge className="absolute top-2 right-2" variant="secondary">
          <Archive className="size-3" />
          Archivada
        </Badge>
      )}
    </div>
  );
}

export default function BranchCard({ branch, customer }: BranchCardProps) {
  const isOwnArchived = !!branch.archived;
  const isCustomerArchived = !!branch.customer?.archived;
  const isArchived = isOwnArchived || isCustomerArchived;

  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const address = formatAddress(branch);

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
        <BranchImage
          isArchived={isArchived}
          name={branch.name}
          src={branchImageSrc(branch)}
        />

        <div className="border-muted border-b p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link
                params={{ customerId: branch.customerId, branchId: branch.id }}
                title={branch.name}
                to="/customers/$customerId/branches/$branchId"
              >
                <h2
                  className={cn(
                    "line-clamp-2 text-lg leading-tight font-semibold transition-colors hover:underline",
                    isArchived ? "text-muted-foreground" : "text-success"
                  )}
                >
                  {branch.name}
                </h2>
              </Link>

              {customer && (
                <div className="mt-2 flex items-center gap-2">
                  {isCustomerArchived ? (
                    <Archive className="text-muted-foreground/70 size-4 shrink-0" />
                  ) : (
                    <Building2 className="text-muted-foreground/70 size-4 shrink-0" />
                  )}
                  <Link
                    className={cn(
                      "line-clamp-1 text-sm font-medium hover:underline",
                      isCustomerArchived
                        ? "text-muted-foreground"
                        : "text-success"
                    )}
                    params={{ customerId: customer.id }}
                    title={customer.name}
                    to="/customers/$customerId"
                  >
                    {customer.name}
                  </Link>
                </div>
              )}
            </div>

            <span className="shrink-0 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-within:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="icon-sm" variant="ghost" />}
                >
                  <span className="sr-only">Abrir menú</span>
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={cn(isCustomerArchived && "min-w-56")}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    {!isArchived && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setIsUpdateFormOpen(true)}
                      >
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {/* An archived customer wins: unarchiving the branch alone would have no effect */}
                    {isCustomerArchived ? (
                      <DropdownMenuItem disabled>
                        <span className="flex flex-col">
                          <span className="flex items-center gap-1.5">
                            <ArchiveRestore className="mr-2 size-4" />
                            Desarchivar
                          </span>
                          <span className="pl-7.5 text-xs">
                            Desarchiva primero el cliente
                          </span>
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setIsStatusDialogOpen(true)}
                      >
                        {isOwnArchived ? (
                          <ArchiveRestore className="mr-2 size-4" />
                        ) : (
                          <Archive className="mr-2 size-4" />
                        )}
                        {isOwnArchived ? "Desarchivar" : "Archivar"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </div>
        </div>

        <div className="flex grow flex-col gap-2 px-4 py-5">
          <div className="flex items-start gap-2">
            <MapPin className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
            <div className="text-muted-foreground flex flex-col text-sm leading-relaxed">
              <span>{address.streetLine}</span>
              <span>{address.locationLine}</span>
            </div>
          </div>

          {branch.phone && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Phone className="text-muted-foreground/70 size-4 shrink-0" />
              <span>{branch.phone}</span>
            </div>
          )}
        </div>

        <Link
          params={{ customerId: branch.customerId, branchId: branch.id }}
          to="/customers/$customerId/branches/$branchId"
        >
          <div className="border-border bg-card group-hover:bg-muted/30 flex items-center justify-between border-t px-4 py-3 transition-colors">
            <span className="text-muted-foreground text-sm font-medium">
              Ver detalles
            </span>
            <ChevronRight className="text-muted-foreground/70 group-hover:text-success size-4 transition-colors" />
          </div>
        </Link>
      </div>

      <BranchFormDialog
        branch={branch}
        customerId={branch.customerId}
        onOpenChange={setIsUpdateFormOpen}
        open={isUpdateFormOpen}
      />
      <ChangeBranchStatusDialog
        branch={branch}
        onOpenChange={setIsStatusDialogOpen}
        open={isStatusDialogOpen}
      />
    </>
  );
}
