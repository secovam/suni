// No drizzle imports: the web app imports this file into the browser bundle.
export const ACQUISITION_CHANNELS = [
  "Redes sociales",
  "Recomendación",
  "Prospección",
  "Teléfono",
  "Correo",
  "Página web",
  "Díptico",
] as const;

export const CUSTOMER_TYPES = ["Cliente", "Asesor"] as const;

// Derived from customer.archived, not a database column.
export const CUSTOMER_STATUSES = ["active", "archived", "all"] as const;
