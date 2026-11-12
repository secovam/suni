import type { AppRouterOutputs } from "@suni/api/routers/index";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { useArchiveContact } from "@/hooks/use-contacts";

type Row = AppRouterOutputs["contacts"]["list"][number];

interface ChangeContactStatusDialogProps {
  contact: Pick<Row, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeContactStatusDialog({
  contact,
  open,
  onOpenChange,
}: ChangeContactStatusDialogProps) {
  const mutation = useArchiveContact();

  return (
    <ChangeStatusDialog
      entity={contact}
      mutation={mutation}
      noun="al contacto"
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
