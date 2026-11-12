interface Archivable {
  archived: unknown;
  customer?: { archived: unknown } | null;
  branch?: { archived: unknown } | null;
}

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

  return {
    isOwnArchived,
    isCustomerArchived,
    isBranchArchived,
    isArchived: isOwnArchived || isBranchArchived,
    parentHint,
  };
}
