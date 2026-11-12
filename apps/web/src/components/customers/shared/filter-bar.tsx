import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@suni/ui/components/input-group";
import { Search, X } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";

interface FilterBarProps {
  search: string;
  searchLabel: string;
  onSearchChange: (search: string) => void;
  /** The filters, each sized by its caller, at the end of the row. */
  children?: ReactNode;
  action?: ReactNode;
}

export function FilterBar({
  search,
  searchLabel,
  onSearchChange,
  children,
  action,
}: FilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // The clear button unmounts with the text, so focus goes back to the search instead of the page.
  const clear = () => {
    onSearchChange("");
    searchRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup className="sm:flex-1">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={searchLabel}
          // Our clear button replaces the browser's own, so there are never two.
          className="[&::-webkit-search-cancel-button]:appearance-none"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`${searchLabel}...`}
          ref={searchRef}
          type="search"
          value={search}
        />
        {search ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpiar búsqueda"
              onClick={clear}
              size="icon-xs"
            >
              <X aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {children}
      {action}
    </div>
  );
}
