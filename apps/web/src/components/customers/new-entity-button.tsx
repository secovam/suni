import { Button } from "@suni/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@suni/ui/components/dialog";
import { ReactSelect } from "@suni/ui/components/react-select";
import { skipToken } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { BranchFormDialog } from "@/components/customers/branches/branch-form-dialog";
import { ContactFormDialog } from "@/components/customers/contacts/contact-form-dialog";
import { byName } from "@/components/customers/shared/filters";
import { useListBranches } from "@/hooks/use-branches";
import { useListCustomers } from "@/hooks/use-customers";

interface PickerProps {
  value: string | null;
  onValueChange: (value: string) => void;
}

function CustomerPicker({ value, onValueChange }: PickerProps) {
  const { data: customers = [], isPending } = useListCustomers({
    status: "active",
  });

  const options = useMemo(
    () =>
      customers
        .toSorted(byName)
        .map((customer) => ({ value: customer.id, label: customer.name })),
    [customers]
  );

  return (
    <ReactSelect
      isLoading={isPending}
      loadingMessage={() => "Cargando…"}
      noOptionsMessage={() => "Sin resultados"}
      onChange={(option) => {
        if (option) {
          onValueChange(option.value);
        }
      }}
      options={options}
      placeholder="Selecciona un cliente"
      value={options.find((option) => option.value === value) ?? null}
    />
  );
}

function BranchPicker({
  customerId,
  value,
  onValueChange,
}: PickerProps & { customerId: string | null }) {
  const { data: branches = [], isPending } = useListBranches(
    customerId ? { customerId } : skipToken
  );

  const options = useMemo(
    () =>
      branches
        .toSorted(byName)
        .map((branch) => ({ value: branch.id, label: branch.name })),
    [branches]
  );

  return (
    <ReactSelect
      isDisabled={!customerId}
      isLoading={!!customerId && isPending}
      loadingMessage={() => "Cargando…"}
      noOptionsMessage={() => "Sin resultados"}
      onChange={(option) => {
        if (option) {
          onValueChange(option.value);
        }
      }}
      options={options}
      placeholder="Selecciona una sucursal"
      value={options.find((option) => option.value === value) ?? null}
    />
  );
}

interface EntityFormProps {
  entity: "branch" | "contact";
  customerId: string;
  branchId: string | null;
  onOpenChange: (open: boolean) => void;
}

function EntityForm({
  entity,
  customerId,
  branchId,
  onOpenChange,
}: EntityFormProps) {
  if (entity === "branch") {
    return (
      <BranchFormDialog
        customerId={customerId}
        onOpenChange={onOpenChange}
        open
      />
    );
  }

  if (!branchId) {
    return null;
  }

  return (
    <ContactFormDialog
      branchId={branchId}
      customerId={customerId}
      onOpenChange={onOpenChange}
      open
    />
  );
}

const COPY = {
  branch: {
    label: "Nueva Sucursal",
    title: "Nueva sucursal",
    description: "Selecciona el cliente al que pertenecerá la sucursal.",
  },
  contact: {
    label: "Nuevo Contacto",
    title: "Nuevo contacto",
    description: "Selecciona a dónde pertenecerá el contacto.",
  },
} as const;

interface NewEntityButtonProps {
  entity: "branch" | "contact";
  customerId?: string;
  branchId?: string;
  label?: string;
  className?: string;
}

type Step = "closed" | "select" | "form";

export function NewEntityButton({
  entity,
  customerId,
  branchId,
  label,
  className,
}: NewEntityButtonProps) {
  const [step, setStep] = useState<Step>("closed");
  const [pickedCustomerId, setPickedCustomerId] = useState<string | null>(null);
  const [pickedBranchId, setPickedBranchId] = useState<string | null>(null);

  const copy = COPY[entity];
  const isContact = entity === "contact";

  const effectiveCustomerId = customerId ?? pickedCustomerId;
  const effectiveBranchId = branchId ?? pickedBranchId;

  const needsCustomer = !customerId;
  const needsBranch = isContact && !branchId;

  const canContinue =
    !!effectiveCustomerId && (!isContact || !!effectiveBranchId);

  const close = () => {
    setStep("closed");
    setPickedCustomerId(null);
    setPickedBranchId(null);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  return (
    <>
      <Button
        className={className}
        onClick={() => setStep(canContinue ? "form" : "select")}
        variant="green"
      >
        <Plus className="mr-2 h-4 w-4" />
        {label ?? copy.label}
      </Button>

      <Dialog
        onOpenChange={(open) => {
          if (!open && step === "select") {
            close();
          }
        }}
        open={step === "select"}
      >
        <DialogContent className="max-w-md overflow-visible">
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {needsCustomer ? (
              <CustomerPicker
                onValueChange={(value) => {
                  setPickedCustomerId(value);
                  setPickedBranchId(null);
                }}
                value={pickedCustomerId}
              />
            ) : null}

            {needsBranch ? (
              <BranchPicker
                customerId={effectiveCustomerId}
                key={effectiveCustomerId ?? "none"}
                onValueChange={setPickedBranchId}
                value={pickedBranchId}
              />
            ) : null}
          </div>

          <DialogFooter>
            <Button onClick={close} variant="outline">
              Cancelar
            </Button>
            <Button
              disabled={!canContinue}
              onClick={() => setStep("form")}
              variant="green"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {step === "form" && effectiveCustomerId ? (
        <EntityForm
          branchId={effectiveBranchId}
          customerId={effectiveCustomerId}
          entity={entity}
          onOpenChange={handleFormOpenChange}
        />
      ) : null}
    </>
  );
}
