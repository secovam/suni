import type { AppRouterOutputs } from "@suni/api/routers/index";
import { userSchema } from "@suni/db/validation/users";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "Usuario" },
] as const;

interface UserFormProps {
  user?: AppRouterOutputs["users"]["get"];
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const submitting = createUser.isPending || updateUser.isPending;

  const defaultValues: z.input<typeof userSchema> = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role === "admin" ? "admin" : "user",
  };

  const form = useAppForm({
    defaultValues,
    // Valida al enviar y, después del primer envío, en cada cambio.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: userSchema },
    onSubmit: ({ value }) => {
      if (user) {
        updateUser.mutate({ id: user.id, ...value }, { onSuccess });
      } else {
        createUser.mutate(value, { onSuccess });
      }
    },
  });

  return (
    <form
      className="@container space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField label="Nombre" placeholder="Juan Pérez" required />
          )}
        </form.AppField>

        <form.AppField name="email">
          {(field) => (
            <field.TextField
              label="Correo"
              placeholder="correo@secovam.com"
              required
              type="email"
            />
          )}
        </form.AppField>
      </div>

      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
        <form.AppField name="role">
          {(field) => (
            <field.SelectField
              label="Rol del usuario"
              options={ROLE_OPTIONS}
              placeholder="Selecciona el rol del usuario..."
              required
            />
          )}
        </form.AppField>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          className="w-full sm:w-auto"
          disabled={submitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={submitting}
          type="submit"
        >
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {user ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
