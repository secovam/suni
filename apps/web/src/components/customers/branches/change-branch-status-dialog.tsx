import type { AppRouterOutputs } from "@suni/api/routers/index";
import type { RefObject } from "react";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { useArchiveBranch } from "@/hooks/use-branches";

type Row = AppRouterOutputs["branches"]["list"][number];

interface ChangeBranchStatusDialogProps {
  branch: Pick<Row, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: RefObject<HTMLElement | null>;
}

export function ChangeBranchStatusDialog({
  branch,
  open,
  onOpenChange,
  finalFocus,
}: ChangeBranchStatusDialogProps) {
  const mutation = useArchiveBranch();

  return (
    <ChangeStatusDialog
      entity={branch}
      finalFocus={finalFocus}
      mutation={mutation}
      noun="la sucursal"
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
