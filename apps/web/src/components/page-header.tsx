import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="bg-card flex flex-col gap-4 rounded-xl border px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-brand/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon aria-hidden className="text-brand size-4.5" />
          </div>
          <h1 className="text-brand truncate text-xl font-bold">{title}</h1>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
