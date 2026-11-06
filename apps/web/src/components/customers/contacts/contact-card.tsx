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
  Building2,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
} from "lucide-react";
import { useState } from "react";

import { ChangeContactStatusDialog } from "./change-contact-status-dialog";
import { ContactFormDialog } from "./contact-form-dialog";

type Contact = AppRouterOutputs["contacts"]["list"][number];

interface ContactCardProps {
  contact: Contact;
  /** Si viene definido, muestra el cliente (útil en listados de varios clientes). */
  customer?: { id: string; name: string };
  readOnly?: boolean;
}

export default function ContactCard({
  contact,
  customer,
  readOnly = false,
}: ContactCardProps) {
  const isArchived = !!contact.archived;
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
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
        {/* Header */}
        <div className="border-muted border-b p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2
                className={cn(
                  "line-clamp-2 text-lg leading-tight font-semibold transition-colors",
                  isArchived ? "text-muted-foreground" : "text-success"
                )}
              >
                {contact.name}
              </h2>

              {contact.position && (
                <p
                  className={cn(
                    "mt-1 line-clamp-1 text-sm font-medium",
                    isArchived
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {contact.position}
                </p>
              )}

              {customer && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Building2 className="text-muted-foreground/70 size-3.5 shrink-0" />
                  <Link
                    className="text-success line-clamp-1 text-sm font-medium hover:underline"
                    params={{ customerId: customer.id }}
                    title={customer.name}
                    to="/customers/$customerId"
                  >
                    {customer.name}
                  </Link>
                </div>
              )}

              {contact.branch && (
                <div className="mt-2 flex items-center gap-1.5">
                  <MapPin className="text-muted-foreground/70 size-3.5 shrink-0" />
                  <Link
                    className="text-success line-clamp-1 text-sm font-medium hover:underline"
                    params={{
                      customerId: contact.customerId,
                      branchId: contact.branch.id,
                    }}
                    title={contact.branch.name}
                    to="/customers/$customerId/branches/$branchId"
                  >
                    {contact.branch.name}
                  </Link>
                </div>
              )}
            </div>

            {!readOnly && (
              <span className="shrink-0 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-within:opacity-100">
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
                          className="cursor-pointer"
                          onClick={() => setIsUpdateFormOpen(true)}
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
            )}
          </div>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex grow flex-col gap-2 p-5",
            isArchived && "opacity-60"
          )}
        >
          <a
            className="group/mail text-muted-foreground hover:text-success flex items-center gap-2 text-sm transition-colors"
            href={`mailto:${contact.email}`}
          >
            <Mail className="text-muted-foreground/70 group-hover/mail:text-success size-4 shrink-0 transition-colors" />
            <span className="truncate">{contact.email}</span>
          </a>

          {contact.phone && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Phone className="text-muted-foreground/70 size-4 shrink-0" />
              <span>
                {contact.phone}
                {contact.phoneExtension && ` ext. ${contact.phoneExtension}`}
              </span>
            </div>
          )}
        </div>

        {/* Archived badge */}
        {isArchived && (
          <div className="px-5 pb-4">
            <Badge variant="secondary">
              <Archive className="size-3" />
              Archivado
            </Badge>
          </div>
        )}
      </div>

      {!readOnly && (
        <>
          <ContactFormDialog
            contact={contact}
            onOpenChange={setIsUpdateFormOpen}
            open={isUpdateFormOpen}
          />
          <ChangeContactStatusDialog
            contact={contact}
            onOpenChange={setIsStatusDialogOpen}
            open={isStatusDialogOpen}
          />
        </>
      )}
    </>
  );
}
