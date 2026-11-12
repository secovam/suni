import { X } from "lucide-react";
import type { ReactNode } from "react";

interface FilterBadgeProps {
  children: ReactNode;
  onClear: () => void;
}

export function FilterBadge({ children, onClear }: FilterBadgeProps) {
  return (
    <button
      className="hover:bg-muted inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
      onClick={onClear}
      type="button"
    >
      {children}
      <X className="ml-1 size-3" />
    </button>
  );
}
