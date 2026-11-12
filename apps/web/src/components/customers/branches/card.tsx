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
  Building2,
  ChevronRight,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
} from "lucide-react";
import { useRef, useState } from "react";

import { ArchivedFooter } from "@/components/customers/shared/archived-footer";

import { ArchiveMenuItem } from "../shared/archive-menu-item";
import { archiveState, archivedLabel } from "../shared/archive-state";
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
    </div>
  );
}

export default function BranchCard({ branch, customer }: BranchCardProps) {
  const archive = archiveState(branch);
  const { isOwnArchived, isCustomerArchived, isArchived, parentHint } = archive;
  const archivedText = archivedLabel(archive, "Archivada");

  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const address = formatAddress(branch);

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "group bg-card relative flex h-full flex-col overflow-hidden rounded-xl border transition-colors duration-200",
          isArchived
            ? "border-border bg-muted/30"
            : "border-border hover:border-primary/30 hover:shadow-md"
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
                    isArchived
                      ? "text-muted-foreground decoration-muted-foreground/50 underline underline-offset-4"
                      : "text-primary"
                  )}
                >
                  {branch.name}
                  {archivedText ? (
                    <span className="sr-only">, {archivedText}</span>
                  ) : null}
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
                        : "text-primary"
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
                  className={cn(parentHint && "min-w-56")}
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
                    <ArchiveMenuItem
                      isOwnArchived={isOwnArchived}
                      onClick={() => setIsStatusDialogOpen(true)}
                      parentHint={parentHint}
                    />
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

        {archivedText ? (
          <ArchivedFooter
            label={archivedText}
            name={branch.name}
            onUnarchive={
              archive.archivedBy === "self"
                ? () => setIsStatusDialogOpen(true)
                : undefined
            }
          />
        ) : (
          <Link
            params={{ customerId: branch.customerId, branchId: branch.id }}
            to="/customers/$customerId/branches/$branchId"
          >
            <div className="border-border bg-card group-hover:bg-muted/30 flex items-center justify-between border-t px-4 py-3 transition-colors">
              <span className="text-muted-foreground text-sm font-medium">
                Ver detalles
              </span>
              <ChevronRight className="text-muted-foreground/70 group-hover:text-primary size-4 transition-colors" />
            </div>
          </Link>
        )}
      </div>

      <BranchFormDialog
        branch={branch}
        customerId={branch.customerId}
        onOpenChange={setIsUpdateFormOpen}
        open={isUpdateFormOpen}
      />
      <ChangeBranchStatusDialog
        finalFocus={cardRef}
        branch={branch}
        onOpenChange={setIsStatusDialogOpen}
        open={isStatusDialogOpen}
      />
    </>
  );
}
