import type { AppRouterOutputs } from "@suni/api/routers/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@suni/ui/components/dialog";
import type { RefObject } from "react";

import { IngredientForm } from "./ingredient-form";

interface IngredientEditDialogProps {
  ingredient: AppRouterOutputs["ingredients"]["get"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus: RefObject<HTMLElement | null>;
}

export function IngredientEditDialog({
  ingredient,
  open,
  onOpenChange,
  finalFocus,
}: IngredientEditDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
        finalFocus={finalFocus}
      >
        <DialogHeader>
          <DialogTitle>Editar ingrediente</DialogTitle>
          <DialogDescription>{ingredient.name}</DialogDescription>
        </DialogHeader>
        <IngredientForm
          ingredient={ingredient}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
