const isNull = { isNull: true } as const;

const isNotNull = { isNotNull: true } as const;

const visible = {
  customer: { archived: isNull },
  branch: { archived: isNull, customer: { archived: isNull } },
  contact: {
    archived: isNull,
    branch: { archived: isNull },
    customer: { archived: isNull },
  },
} as const;

const archived = {
  customer: { archived: isNotNull },
  branch: {
    OR: [{ archived: isNotNull }, { customer: { archived: isNotNull } }],
  },
  contact: {
    OR: [
      { archived: isNotNull },
      { branch: { archived: isNotNull } },
      { customer: { archived: isNotNull } },
    ],
  },
} as const;

type Entity = keyof typeof visible;

type Status = "active" | "archived" | "all";

export function statusWhere(entity: Entity, status: Status) {
  if (status === "all") {
    return {};
  }

  if (status === "active") {
    return visible[entity];
  }

  return archived[entity];
}
