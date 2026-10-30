export function stripAccents(value: string): string {
  return value.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "");
}
