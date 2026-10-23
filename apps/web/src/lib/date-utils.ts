export type DateInput = Date | string | number;

type MaybeDateInput = DateInput | null | undefined;

const LOCALE = "es-MX";

function toValidDate(value: MaybeDateInput): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(date: DateInput): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(date: DateInput): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTimeLong(value: MaybeDateInput): string {
  const date = toValidDate(value);

  if (!date) {
    return "--";
  }

  return date.toLocaleString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function toDatetimeLocalValue(value: MaybeDateInput): string {
  const date = toValidDate(value);

  if (!date) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function formatDateWithWeekday(date: DateInput): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(value: MaybeDateInput): string {
  const date = toValidDate(value);

  if (!date) {
    return "--:--";
  }

  return date.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDuration(
  start: MaybeDateInput,
  end: MaybeDateInput
): string {
  const startDate = toValidDate(start);
  const endDate = toValidDate(end);

  if (!(startDate && endDate)) {
    return "--";
  }

  const minutes = Math.max(0, Math.round((+endDate - +startDate) / 60_000));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

const MS_PER_DAY = 86_400_000;

export function daysUntil(date: DateInput): number {
  const target = new Date(date);
  const today = new Date();

  const targetDay = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return Math.round((targetDay - todayDay) / MS_PER_DAY);
}
