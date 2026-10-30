export type DateInput = Date | string | number;

const LOCALE = "es-MX";

export function formatDate(date: DateInput): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
