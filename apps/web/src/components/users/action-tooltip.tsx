import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@suni/ui/components/tooltip";
import type { ReactNode } from "react";

interface ActionTooltipProps {
  label: string;
  children: ReactNode;
}

// The span takes the hover because disabled buttons have pointer-events: none.
export function ActionTooltip({ label, children }: ActionTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
