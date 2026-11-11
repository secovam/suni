import { Button } from "@suni/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@suni/ui/components/input-group";
import { Search, X } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";

interface FilterBarProps {
  search: string;
  searchLabel: string;
  onSearchChange: (search: string) => void;
  hasFilters: boolean;
  onClear: () => void;
  /** The selects, each sized by its caller. */
  children?: ReactNode;
  action?: ReactNode;
}

export function FilterBar({
  search,
  searchLabel,
  onSearchChange,
  hasFilters,
  onClear,
  children,
  action,
}: FilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // The clear button unmounts once nothing is filtered, so focus moves to the search instead of the page.
  const clear = () => {
    onClear();
    searchRef.current?.focus();
  };

  return (
    // Selects keep their width; the row wraps before the search gets squeezed next to the sidebar.
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <InputGroup className="lg:max-w-sm lg:min-w-56 lg:flex-1">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={searchLabel}
          onChange={(event) => onSearchChange(event.target.value)}
          ref={searchRef}
          placeholder={`${searchLabel}...`}
          type="search"
          value={search}
        />
      </InputGroup>
      {children}
      {hasFilters || action ? (
        <div className="flex items-center gap-2 lg:ml-auto">
          {hasFilters ? (
            <Button onClick={clear} variant="ghost">
              <X aria-hidden />
              Limpiar filtros
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
