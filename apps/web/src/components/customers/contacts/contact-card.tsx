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

function getArchiveState(contact: Contact) {
  const isOwn = !!contact.archived;
  const isCustomer = !!contact.customer?.archived;
  const isBranch = !!contact.branch?.archived;
  const isParent = isCustomer || isBranch;

  let label = "Archivado";

  if (isCustomer) {
    label = "Cliente archivado";
  } else if (isBranch) {
    label = "Sucursal archivada";
  }

  return { isOwn, isParent, isArchived: isOwn || isParent, label };
}

interface ContactMenuProps {
  isArchived: boolean;
  isOwnArchived: boolean;
  isParentArchived: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
}

function ContactMenu({
  isArchived,
  isOwnArchived,
  isParentArchived,
  onEdit,
  onToggleStatus,
}: ContactMenuProps) {
  return (
    <span className="shrink-0 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-within:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <span className="sr-only">Abrir menú</span>
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {!isArchived && (
              <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
            )}

            {/* Si un padre lo archiva, desarchivarlo no tendría efecto */}
            {!isParentArchived && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={onToggleStatus}
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
  );
}

interface ContactParentsProps {
  contact: Contact;
  customer?: { id: string; name: string };
}

function ContactParents({ contact, customer }: ContactParentsProps) {
  return (
    <>
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
    </>
  );
}

function ContactPhone({ contact }: { contact: Contact }) {
  if (!contact.phone) {
    return null;
  }

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Phone className="text-muted-foreground/70 size-4 shrink-0" />
      <span>
        {contact.phone}
        {contact.phoneExtension && ` ext. ${contact.phoneExtension}`}
      </span>
    </div>
  );
}

export default function ContactCard({
  contact,
  customer,
  readOnly = false,
}: ContactCardProps) {
  const { isOwn, isParent, isArchived, label } = getArchiveState(contact);

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

              <ContactParents contact={contact} customer={customer} />
            </div>

            {!readOnly && (
              <ContactMenu
                isArchived={isArchived}
                isOwnArchived={isOwn}
                isParentArchived={isParent}
                onEdit={() => setIsUpdateFormOpen(true)}
                onToggleStatus={() => setIsStatusDialogOpen(true)}
              />
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

          <ContactPhone contact={contact} />
        </div>

        {/* Archived badge */}
        {isArchived && (
          <div className="px-5 pb-4">
            <Badge variant="secondary">
              <Archive className="size-3" />
              {label}
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
