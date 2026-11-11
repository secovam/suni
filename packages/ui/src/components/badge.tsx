import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        secondary:
          "bg-muted text-muted-foreground",
        destructive:
          "bg-destructive/10 text-destructive",
        success:
          "bg-success/10 text-success",
        outline: "text-muted-foreground ring-1 ring-border ring-inset",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };