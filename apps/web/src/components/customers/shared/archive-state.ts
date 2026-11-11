interface Archivable {
  archived: unknown;
  customer?: { archived: unknown } | null;
  branch?: { archived: unknown } | null;
}

const INHERITED_FROM = {
  customer: " con el cliente",
  branch: " con la sucursal",
  self: "",
} as const;

// Mirrors the API rule: an archived customer or branch archives everything under it.
export function archiveState(entity: Archivable) {
  const isOwnArchived = !!entity.archived;
  const isCustomerArchived = !!entity.customer?.archived;
  const isBranchArchived = isCustomerArchived || !!entity.branch?.archived;

  let parentHint: string | undefined;

  if (isCustomerArchived) {
    parentHint = "Desarchiva primero el cliente";
  } else if (isBranchArchived) {
    parentHint = "Desarchiva primero la sucursal";
  }

  // Parent first, like parentHint: the parent is what has to be unarchived first.
  let archivedBy: keyof typeof INHERITED_FROM | null = null;

  if (isCustomerArchived) {
    archivedBy = "customer";
  } else if (isBranchArchived) {
    archivedBy = "branch";
  } else if (isOwnArchived) {
    archivedBy = "self";
  }

  return {
    archivedBy,
    isOwnArchived,
    isCustomerArchived,
    isBranchArchived,
    isArchived: isOwnArchived || isBranchArchived,
    parentHint,
  };
}

/** "Archivado", "Archivada con el cliente"…, shared by cards and detail headers. */
export function archivedLabel(
  { archivedBy }: ReturnType<typeof archiveState>,
  base: "Archivado" | "Archivada"
) {
  return archivedBy ? `${base}${INHERITED_FROM[archivedBy]}` : null;
}
