import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Link } from "@tanstack/react-router";

interface IngredientDataProps {
  ingredient: AppRouterOutputs["ingredients"]["get"];
}

export function IngredientData({ ingredient }: IngredientDataProps) {
  return (
    <section
      aria-label="Datos del ingrediente"
      className="bg-card space-y-5 rounded-xl border p-5"
    >
      <dl className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs font-medium">
            Proveedor
          </dt>
          <dd className="text-sm">
            <Link
              className="text-primary hover:underline"
              params={{ supplierId: ingredient.supplierId }}
              to="/suppliers/$supplierId"
            >
              {ingredient.supplier.name}
            </Link>
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs font-medium">
            Unidad de medida
          </dt>
          <dd className="text-sm">{ingredient.unit}</dd>
        </div>
      </dl>
      {ingredient.imageUrl ? (
        <img
          alt={ingredient.name}
          className="max-h-80 max-w-full rounded-lg object-contain"
          referrerPolicy="no-referrer"
          src={ingredient.imageUrl}
        />
      ) : null}
    </section>
  );
}
