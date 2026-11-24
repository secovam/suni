import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Badge } from "@suni/ui/components/badge";
import { Link } from "@tanstack/react-router";

interface IngredientCardProps {
  ingredient: AppRouterOutputs["ingredients"]["list"][number];
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  return (
    <article className="bg-card overflow-hidden rounded-xl border">
      {ingredient.imageUrl ? (
        <img
          alt={ingredient.name}
          className="bg-muted aspect-video w-full object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          src={ingredient.imageUrl}
        />
      ) : null}
      <div className="space-y-2 p-4">
        <h2 className="text-primary text-lg font-semibold wrap-break-word">
          <Link
            className="hover:underline"
            params={{ ingredientId: ingredient.id }}
            to="/ingredients/$ingredientId"
          >
            {ingredient.name}
          </Link>
        </h2>
        <p className="text-muted-foreground text-sm">
          {ingredient.supplier.name}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{ingredient.unit}</Badge>
          {ingredient.archived ? (
            <Badge variant="outline">Archivado</Badge>
          ) : null}
        </div>
      </div>
    </article>
  );
}
