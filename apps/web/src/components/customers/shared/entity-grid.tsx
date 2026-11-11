import { cn } from "@suni/ui/lib/utils";
import { SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EntityGridProps {
  query: { isPending: boolean; isError: boolean; isPlaceholderData: boolean };
  isEmpty: boolean;
  hasFilters: boolean;
  icon: LucideIcon;
  copy: {
    loading: string;
    error: string;
    notFound: string;
    empty: string;
    emptyHint: string;
  };
  children: ReactNode;
}

export function EntityGrid({
  query,
  isEmpty,
  hasFilters,
  icon,
  copy,
  children,
}: EntityGridProps) {
  if (query.isPending) {
    return (
      <p className="text-muted-foreground p-8 text-center text-sm">
        {copy.loading}
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="text-destructive p-8 text-center text-sm">{copy.error}</p>
    );
  }

  if (isEmpty) {
    const Icon = hasFilters ? SearchX : icon;

    return (
      <div className="flex min-h-70 flex-col items-center justify-center p-8 text-center">
        <Icon
          className="text-muted-foreground/70 mb-4 size-12"
          strokeWidth={1}
        />
        <p className="text-muted-foreground text-sm font-medium">
          {hasFilters ? copy.notFound : copy.empty}
        </p>
        <p className="text-muted-foreground/70 mt-1 text-xs">
          {hasFilters
            ? "Intenta con otros filtros de búsqueda"
            : copy.emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div
      aria-busy={query.isPlaceholderData}
      className={cn(
        "grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2",
        query.isPlaceholderData && "opacity-50"
      )}
      // Stale rows stay visible while the new filter loads; block pointer and keyboard on them.
      inert={query.isPlaceholderData}
    >
      {children}
    </div>
  );
}
