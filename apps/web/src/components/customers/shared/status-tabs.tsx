import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@suni/ui/components/tabs";
import type { ReactNode } from "react";

import type { StatusFilter } from "./filters";
import { SegmentedControl } from "./segmented-control";

const LABELS = {
  masculine: { active: "Activos", archived: "Archivados", all: "Todos" },
  feminine: { active: "Activas", archived: "Archivadas", all: "Todas" },
} as const;

interface StatusControlProps {
  value: StatusFilter;
  onValueChange: (status: StatusFilter) => void;
  /** Omitted while loading, so no option shows a false zero. */
  counts?: Record<StatusFilter, number>;
  gender?: keyof typeof LABELS;
}

/** The status is the list's view, so it is a tab with its count, not one more filter. */
export function StatusTabs({
  value,
  onValueChange,
  counts,
  gender = "masculine",
  children,
}: StatusControlProps & { children: ReactNode }) {
  return (
    <Tabs
      onValueChange={(next: StatusFilter) => onValueChange(next)}
      value={value}
    >
      <TabsList aria-label="Estado">
        {CUSTOMER_STATUSES.map((status) => (
          <TabsTrigger key={status} value={status}>
            {LABELS[gender][status]}
            {counts ? (
              <span className="text-muted-foreground text-xs tabular-nums">
                {counts[status]}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent className="mt-4" value={value}>
        <div className="flex flex-col gap-4">{children}</div>
      </TabsContent>
    </Tabs>
  );
}

/** The status inside a page that already has tabs, so it does not read as a second row of sections. */
export function StatusSegmented({
  value,
  onValueChange,
  counts,
  gender = "masculine",
}: StatusControlProps) {
  return (
    <SegmentedControl
      legend="Estado"
      onValueChange={onValueChange}
      options={CUSTOMER_STATUSES.map((status) => ({
        value: status,
        label: LABELS[gender][status],
        count: counts?.[status],
      }))}
      value={value}
    />
  );
}
