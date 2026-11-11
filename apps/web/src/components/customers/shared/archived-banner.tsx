import { Archive } from "lucide-react";

interface ArchivedBannerProps {
  label: string;
}

/** Opens an archived card so the state is seen first; the card title carries it for screen readers. */
export function ArchivedBanner({ label }: ArchivedBannerProps) {
  return (
    <div
      aria-hidden
      className="bg-muted text-muted-foreground flex items-center gap-1.5 border-b px-4 py-1.5 text-xs font-medium"
    >
      <Archive aria-hidden className="size-3.5 shrink-0" />
      {label}
    </div>
  );
}
