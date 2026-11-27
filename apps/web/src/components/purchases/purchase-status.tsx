import type { AppRouterOutputs } from "@suni/api/routers/index";
import { cn } from "@suni/ui/lib/utils";

import {
  PURCHASE_STATUS_COLOR,
  PURCHASE_STATUS_LABEL,
} from "./purchase-display";

type Status = AppRouterOutputs["purchases"]["list"][number]["status"];

export function PurchaseStatus({
  status,
  partial = false,
}: {
  status: Status;
  partial?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        PURCHASE_STATUS_COLOR[partial ? "partial" : status]
      )}
    >
      {partial ? "Cancelación parcial" : PURCHASE_STATUS_LABEL[status]}
    </span>
  );
}
