import { DropdownMenuItem } from "@suni/ui/components/dropdown-menu";
import { Archive, ArchiveRestore } from "lucide-react";

interface ArchiveMenuItemProps {
  isOwnArchived: boolean;
  /** Set when an archived parent blocks the change. */
  parentHint?: string;
  onClick: () => void;
}

export function ArchiveMenuItem({
  isOwnArchived,
  parentHint,
  onClick,
}: ArchiveMenuItemProps) {
  if (parentHint) {
    return (
      <DropdownMenuItem disabled>
        <span className="flex flex-col">
          <span className="flex items-center gap-1.5">
            <ArchiveRestore className="mr-2 size-4" />
            Desarchivar
          </span>
          <span className="pl-7.5 text-xs">{parentHint}</span>
        </span>
      </DropdownMenuItem>
    );
  }

  const Icon = isOwnArchived ? ArchiveRestore : Archive;

  return (
    <DropdownMenuItem className="cursor-pointer" onClick={onClick}>
      <Icon className="mr-2 size-4" />
      {isOwnArchived ? "Desarchivar" : "Archivar"}
    </DropdownMenuItem>
  );
}
