import type { AppRouterOutputs } from "@suni/api/routers/index";
import type { RefObject } from "react";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { useArchiveContact } from "@/hooks/use-contacts";

type Row = AppRouterOutputs["contacts"]["list"][number];

interface ChangeContactStatusDialogProps {
  contact: Pick<Row, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: RefObject<HTMLElement | null>;
}

export function ChangeContactStatusDialog({
  contact,
  open,
  onOpenChange,
  finalFocus,
}: ChangeContactStatusDialogProps) {
  const mutation = useArchiveContact();

  return (
    <ChangeStatusDialog
      entity={contact}
      finalFocus={finalFocus}
      mutation={mutation}
      noun="al contacto"
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
