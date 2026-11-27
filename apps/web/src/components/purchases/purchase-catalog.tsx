import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { Label } from "@suni/ui/components/label";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

import { matchingName } from "@/components/customers/shared/filters";
import { formatIngredientPrice } from "@/components/ingredients/format-ingredient-price";

type Ingredient = AppRouterOutputs["ingredients"]["list"][number];

const PLACEHOLDER_IMAGE = "/placeholder.webp";

interface PurchaseIngredientCardProps {
  ingredient: Ingredient;
  selected: boolean;
  disabled: boolean;
  onAdd: () => void;
}

function PurchaseIngredientCard({
  ingredient,
  selected,
  disabled,
  onAdd,
}: PurchaseIngredientCardProps) {
  return (
    <article className="bg-card hover:border-primary/30 flex h-full flex-col overflow-hidden rounded-xl border transition-colors">
      <div className="bg-muted h-28 overflow-hidden">
        <img
          alt={ingredient.imageUrl ? ingredient.name : ""}
          className="size-full object-cover"
          loading="lazy"
          onError={({ currentTarget }) => {
            if (currentTarget.getAttribute("src") !== PLACEHOLDER_IMAGE) {
              currentTarget.src = PLACEHOLDER_IMAGE;
            }
          }}
          referrerPolicy="no-referrer"
          src={ingredient.imageUrl || PLACEHOLDER_IMAGE}
        />
      </div>
      <div className="flex grow flex-col gap-2 p-3">
        <div>
          <h3 className="text-primary line-clamp-2 font-semibold wrap-break-word">
            {ingredient.name}
          </h3>
          <p className="text-muted-foreground text-sm break-words">
            {ingredient.supplier.name}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {formatIngredientPrice(ingredient)}
          </span>
          <Badge variant="secondary">{ingredient.unit}</Badge>
        </div>
        <Button
          aria-label={
            selected
              ? `${ingredient.name} en la orden`
              : `Agregar ${ingredient.name} a la orden`
          }
          disabled={selected || disabled}
          onClick={onAdd}
          size="sm"
          type="button"
          variant={selected ? "secondary" : "outline"}
        >
          {selected ? <Check aria-hidden /> : <Plus aria-hidden />}
          {selected ? "En la orden" : "Agregar a la orden"}
        </Button>
      </div>
    </article>
  );
}

interface PurchaseCatalogProps {
  ingredients: Ingredient[];
  selected: ReadonlySet<string>;
  disabled: boolean;
  query: { isPending: boolean; isError: boolean; refetch: () => void };
  onAdd: (ingredient: Ingredient) => void;
}

export function PurchaseCatalog({
  ingredients,
  selected,
  disabled,
  query,
  onAdd,
}: PurchaseCatalogProps) {
  const [name, setName] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const suppliers = [
    ...new Map(
      ingredients.map(({ supplier }) => [supplier.id, supplier])
    ).values(),
  ].toSorted((left, right) => left.name.localeCompare(right.name, "es-MX"));

  const filtered = matchingName(ingredients, name).filter(
    ({ supplier }) => supplierId === "" || supplier.id === supplierId
  );

  return (
    <section
      aria-labelledby="purchase-catalog-heading"
      className="min-w-0 space-y-3"
    >
      <h2 className="text-base font-semibold" id="purchase-catalog-heading">
        Ingredientes disponibles
      </h2>
      <div className="bg-card grid gap-3 rounded-xl border p-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="purchase-catalog-name">Nombre de la sustancia</Label>
          <Input
            id="purchase-catalog-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Buscar ingrediente"
            type="search"
            value={name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-catalog-supplier">Proveedor</Label>
          <select
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
            id="purchase-catalog-supplier"
            onChange={(event) => setSupplierId(event.target.value)}
            value={supplierId}
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {query.isPending ? (
        <output className="text-muted-foreground text-sm">
          Cargando ingredientes…
        </output>
      ) : null}
      {query.isError ? (
        <div className="flex items-center gap-3">
          <p className="text-destructive text-sm" role="alert">
            No se pudo cargar el catálogo.
          </p>
          <Button
            onClick={() => query.refetch()}
            type="button"
            variant="outline"
          >
            Reintentar
          </Button>
        </div>
      ) : null}
      {!query.isPending && !query.isError && filtered.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-sm">
          {ingredients.length === 0
            ? "No hay ingredientes activos."
            : "No se encontraron ingredientes con estos filtros."}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((ingredient) => (
          <PurchaseIngredientCard
            disabled={disabled}
            ingredient={ingredient}
            key={ingredient.id}
            onAdd={() => onAdd(ingredient)}
            selected={selected.has(ingredient.id)}
          />
        ))}
      </div>
    </section>
  );
}
