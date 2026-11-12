import type { AppRouterOutputs } from "@suni/api/routers/index";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { useArchiveBranch } from "@/hooks/use-branches";

type Row = AppRouterOutputs["branches"]["list"][number];

interface ChangeBranchStatusDialogProps {
  branch: Pick<Row, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeBranchStatusDialog({
  branch,
  open,
  onOpenChange,
}: ChangeBranchStatusDialogProps) {
  const mutation = useArchiveBranch();

  return (
    <ChangeStatusDialog
      entity={branch}
      mutation={mutation}
      noun="la sucursal"
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}
