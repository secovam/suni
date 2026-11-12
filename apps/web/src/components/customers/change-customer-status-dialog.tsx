import type { AppRouterOutputs } from "@suni/api/routers/index";
import type { RefObject } from "react";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { useArchiveCustomer } from "@/hooks/use-customers";

type Row = AppRouterOutputs["customers"]["list"][number];

interface ChangeCustomerStatusDialogProps {
  customer: Pick<Row, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: RefObject<HTMLElement | null>;
}

export function ChangeCustomerStatusDialog({
  customer,
  open,
  onOpenChange,
  finalFocus,
}: ChangeCustomerStatusDialogProps) {
  const mutation = useArchiveCustomer();

  return (
    <ChangeStatusDialog
      entity={customer}
      finalFocus={finalFocus}
      mutation={mutation}
      noun="al cliente"
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
