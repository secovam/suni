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

  let parentHint: string | undefined;

  if (isCustomer) {
    parentHint = "Desarchiva primero el cliente";
  } else if (isBranch) {
    parentHint = "Desarchiva primero la sucursal";
  }

  return {
    isOwn,
    isCustomerArchived: isCustomer,
    // A branch under an archived customer is effectively archived too.
    isBranchArchived: isCustomer || isBranch,
    parentHint,
    isArchived: isOwn || isCustomer || isBranch,
  };
}

interface ContactMenuProps {
  isArchived: boolean;
  isOwnArchived: boolean;
  /** Set when an archived parent blocks unarchiving the contact. */
  parentHint?: string;
  onEdit: () => void;
  onToggleStatus: () => void;
}

function ContactMenu({
  isArchived,
  isOwnArchived,
  parentHint,
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
        <DropdownMenuContent
          align="end"
          className={cn(parentHint && "min-w-56")}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {!isArchived && (
              <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
            )}

            {/* An archived parent wins: unarchiving the contact alone would have no effect */}
            {parentHint ? (
              <DropdownMenuItem disabled>
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5">
                    <ArchiveRestore className="mr-2 size-4" />
                    Desarchivar
                  </span>
                  <span className="pl-7.5 text-xs">{parentHint}</span>
                </span>
              </DropdownMenuItem>
            ) : (
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
  isCustomerArchived: boolean;
  isBranchArchived: boolean;
}

const PARENT_LINK = "line-clamp-1 text-sm font-medium hover:underline";

function nameColor(isArchived: boolean) {
  return isArchived ? "text-muted-foreground" : "text-success";
}

function ContactParents({
  contact,
  customer,
  isCustomerArchived,
  isBranchArchived,
}: ContactParentsProps) {
  const CustomerIcon = isCustomerArchived ? Archive : Building2;
  const BranchIcon = isBranchArchived ? Archive : MapPin;

  return (
    <>
      {customer && (
        <div className="mt-2 flex items-center gap-2">
          <CustomerIcon className="text-muted-foreground/70 size-4 shrink-0" />
          <Link
            className={cn(PARENT_LINK, nameColor(isCustomerArchived))}
            params={{ customerId: customer.id }}
            title={customer.name}
            to="/customers/$customerId"
          >
            {customer.name}
          </Link>
        </div>
      )}

      {contact.branch && (
        <div className="mt-2 flex items-center gap-2">
          <BranchIcon className="text-muted-foreground/70 size-4 shrink-0" />
          <Link
            className={cn(PARENT_LINK, nameColor(isBranchArchived))}
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
  const {
    isOwn,
    isCustomerArchived,
    isBranchArchived,
    parentHint,
    isArchived,
  } = getArchiveState(contact);

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
                  nameColor(isArchived)
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

              <ContactParents
                contact={contact}
                customer={customer}
                isBranchArchived={isBranchArchived}
                isCustomerArchived={isCustomerArchived}
              />
            </div>

            {!readOnly && (
              <ContactMenu
                isArchived={isArchived}
                isOwnArchived={isOwn}
                parentHint={parentHint}
                onEdit={() => setIsUpdateFormOpen(true)}
                onToggleStatus={() => setIsStatusDialogOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex grow flex-col gap-2 px-4 py-5">
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
          <div className="px-4 pb-4">
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
