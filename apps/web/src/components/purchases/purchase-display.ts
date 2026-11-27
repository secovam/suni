const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function purchaseAmount(value: string | null) {
  if (value === null) {
    return "Pendiente";
  }

  const [whole = "0", cents = "00"] = value.split(".");

  return mxn
    .formatToParts(BigInt(whole))
    .map((part) => (part.type === "fraction" ? cents : part.value))
    .join("");
}

export function purchaseItemCount(count: number) {
  return count === 1 ? "1 partida" : `${count} partidas`;
}

export const PURCHASE_STATUS_LABEL = {
  draft: "Borrador",
  generated: "Generada",
  sent: "Enviada",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

export const PURCHASE_STATUS_COLOR = {
  draft: "bg-muted text-muted-foreground",
  generated: "bg-primary/10 text-primary",
  sent: "bg-accent text-accent-foreground",
  confirmed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  partial: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
};
