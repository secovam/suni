import type { AppRouterOutputs } from "@suni/api/routers/index";

const currency = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  style: "currency",
});

export function formatIngredientPrice({
  price,
  unit,
}: Pick<AppRouterOutputs["ingredients"]["get"], "price" | "unit">) {
  return price === null
    ? "Sin precio"
    : `${currency.format(Number(price))} MXN / ${unit}`;
}
