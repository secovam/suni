import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@suni/ui/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { ChevronRight, MoreVertical, Pencil } from "lucide-react";

import { ArchiveMenuItem } from "@/components/customers/shared/archive-menu-item";
import { ArchivedFooter } from "@/components/customers/shared/archived-footer";

import { formatIngredientPrice } from "./format-ingredient-price";

const PLACEHOLDER_IMAGE = "/placeholder.webp";

interface IngredientCardProps {
  ingredient: AppRouterOutputs["ingredients"]["list"][number];
  onEdit?: () => void;
  onChangeStatus?: () => void;
}

export function IngredientCard({
  ingredient,
  onEdit,
  onChangeStatus,
}: IngredientCardProps) {
  const params = { ingredientId: ingredient.id };

  return (
    <article className="group bg-card hover:border-primary/30 flex h-full flex-col overflow-hidden rounded-xl border transition-colors">
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
      <div className="grow space-y-1 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-primary line-clamp-2 font-semibold wrap-break-word">
            <Link
              className="hover:underline"
              params={params}
              to="/ingredients/$ingredientId"
            >
              {ingredient.name}
            </Link>
          </h2>
          {onChangeStatus ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="icon-sm" variant="ghost" />}
              >
                <span className="sr-only">Acciones de {ingredient.name}</span>
                <MoreVertical aria-hidden className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  {onEdit ? (
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil aria-hidden className="mr-2 size-4" />
                      Editar
                    </DropdownMenuItem>
                  ) : null}
                  <ArchiveMenuItem
                    isOwnArchived={!!ingredient.archived}
                    onClick={onChangeStatus}
                  />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">
          {ingredient.supplier.name}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold tabular-nums">
            {formatIngredientPrice(ingredient)}
          </p>
          <Badge variant="secondary">{ingredient.unit}</Badge>
        </div>
      </div>
      {ingredient.archived ? (
        <ArchivedFooter
          label="Archivado"
          name={ingredient.name}
          onUnarchive={onChangeStatus}
        />
      ) : (
        <Link
          className="text-muted-foreground hover:text-primary flex min-h-6 items-center gap-1 self-end px-3 pb-1 text-xs font-medium hover:underline"
          params={params}
          to="/ingredients/$ingredientId"
        >
          Ver detalles
          <ChevronRight aria-hidden className="size-3" />
        </Link>
      )}
    </article>
  );
}
