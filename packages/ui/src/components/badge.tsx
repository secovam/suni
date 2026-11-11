import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary",
        secondary:
          "border-secondary-foreground/20 bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        success:
          "border-success/30 bg-success/10 text-success",
        outline: "text-foreground",
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