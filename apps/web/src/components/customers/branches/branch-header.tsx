import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import { cn } from "@suni/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Building2, Pencil } from "lucide-react";
import { useState } from "react";

import { archiveState, archivedLabel } from "../shared/archive-state";
import { ChangeBranchStatusDialog } from "./change-branch-status-dialog";

type Branch = AppRouterOutputs["branches"]["get"];

interface BranchHeaderProps {
  branch: Pick<Branch, "id" | "customerId" | "name" | "archived" | "customer">;
  onEdit?: () => void;
}

export function BranchHeader({ branch, onEdit }: BranchHeaderProps) {
  const archive = archiveState(branch);

  const { isOwnArchived, isCustomerArchived, isArchived } = archive;

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-xl border px-5 py-4",
          isArchived
            ? "border-border/60 bg-muted/40"
            : "border-border from-muted/60 to-muted/20 bg-linear-to-r"
        )}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                isArchived ? "bg-muted" : "bg-primary/10"
              )}
            >
              <Building2
                className={cn(
                  "size-4.5",
                  isArchived ? "text-muted-foreground" : "text-primary"
                )}
              />
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <h1
                className={cn(
                  "truncate text-xl font-bold",
                  isArchived ? "text-muted-foreground" : "text-primary"
                )}
              >
                {branch.name}
              </h1>
              {isArchived ? (
                <Badge className="shrink-0" variant="secondary">
                  <Archive className="size-3" />
                  {archivedLabel(archive, "Archivada")}
                </Badge>
              ) : null}
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Sucursal de{" "}
            <Link
              className="hover:underline"
              params={{ customerId: branch.customerId }}
              to="/customers/$customerId"
            >
              {branch.customer.name}
            </Link>
          </p>
        </div>

        {/* An archived customer wins: unarchive it first, from its own page */}
        {onEdit && !isCustomerArchived ? (
          <div className="flex shrink-0 items-center gap-2">
            {isArchived ? null : (
              <Button onClick={onEdit} size="sm">
                <Pencil className="size-3.5" />
                Editar
              </Button>
            )}
            <Button
              onClick={() => setIsStatusDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              {isOwnArchived ? (
                <ArchiveRestore className="size-3.5" />
              ) : (
                <Archive className="size-3.5" />
              )}
              {isOwnArchived ? "Desarchivar" : "Archivar"}
            </Button>
          </div>
        ) : null}
      </div>

      <ChangeBranchStatusDialog
        branch={branch}
        onOpenChange={setIsStatusDialogOpen}
        open={isStatusDialogOpen}
      />
    </>
  );
}
