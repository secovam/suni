import { Button } from "@suni/ui/components/button";
import { Archive } from "lucide-react";

interface ArchivedFooterProps {
  label: string;
  /** Names the card for screen readers, since every archived card has its own "Desarchivar". */
  name: string;
  /** Absent when a parent is archived: that parent has to be unarchived first. */
  onUnarchive?: () => void;
}

/** Closes an archived card with its state and, when possible, the way back. The title carries the state for screen readers. */
export function ArchivedFooter({
  label,
  name,
  onUnarchive,
}: ArchivedFooterProps) {
  return (
    <div className="bg-muted text-muted-foreground mt-auto flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <span aria-hidden className="flex items-center gap-1.5 font-medium">
        <Archive className="size-4 shrink-0" />
        {label}
      </span>
      {onUnarchive ? (
        <Button
          className="-my-2 -mr-4 shrink-0"
          onClick={onUnarchive}
          variant="link"
        >
          Desarchivar<span className="sr-only"> {name}</span>
        </Button>
      ) : null}
    </div>
  );
}
