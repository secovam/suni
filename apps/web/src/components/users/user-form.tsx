import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "Usuario" },
] as const;

const userSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z.email({ message: "El correo no es válido" }),
  role: z.enum(["admin", "user"]),
});

interface UserFormProps {
  user?: AppRouterOutputs["users"]["get"];
}

export function UserForm({ user }: UserFormProps) {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const submitting = createUser.isPending || updateUser.isPending;

  const goToUsers = () => navigate({ to: "/users" });

  const defaultValues: z.infer<typeof userSchema> = {
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
        updateUser.mutate({ id: user.id, ...value }, { onSuccess: goToUsers });
      } else {
        createUser.mutate(value, { onSuccess: goToUsers });
      }
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      <div className="flex w-full justify-end">
        <div className="flex w-1/2 space-x-4 pt-12 lg:pl-2">
          <Button
            className="w-full"
            disabled={submitting}
            nativeButton={false}
            render={<Link to="/users" />}
            variant="outline-destructive"
          >
            Cancelar
          </Button>
          <Button
            className="w-full"
            disabled={submitting}
            type="submit"
            variant="green"
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {user?.id ? "Guardar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  );
}
