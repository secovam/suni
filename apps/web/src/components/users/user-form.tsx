import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { Label } from "@suni/ui/components/label";
import { ReactSelect } from "@suni/ui/components/react-select";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";

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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-destructive text-sm" id={id} role="alert">
      {message}
    </p>
  );
}

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

  const form = useForm({
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
        <form.Field name="name">
          {(field) => {
            const [error] = field.state.meta.errors;
            const errorId = `${field.name}-error`;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Nombre<span className="text-destructive">*</span>
                </Label>
                <Input
                  aria-describedby={error && errorId}
                  aria-invalid={Boolean(error)}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Juan Pérez"
                  type="text"
                  value={field.state.value}
                />
                <FieldError id={errorId} message={error?.message} />
              </div>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const [error] = field.state.meta.errors;
            const errorId = `${field.name}-error`;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Correo<span className="text-destructive">*</span>
                </Label>
                <Input
                  aria-describedby={error && errorId}
                  aria-invalid={Boolean(error)}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="correo@secovam.com"
                  type="email"
                  value={field.state.value}
                />
                <FieldError id={errorId} message={error?.message} />
              </div>
            );
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form.Field name="role">
          {(field) => {
            const [error] = field.state.meta.errors;
            const errorId = `${field.name}-error`;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Rol del usuario<span className="text-destructive">*</span>
                </Label>
                <ReactSelect
                  aria-describedby={error && errorId}
                  aria-invalid={Boolean(error)}
                  inputId={field.name}
                  onBlur={field.handleBlur}
                  onChange={(option) => {
                    if (option) {
                      field.handleChange(option.value);
                    }
                  }}
                  options={ROLE_OPTIONS}
                  placeholder="Selecciona el rol del usuario..."
                  value={
                    ROLE_OPTIONS.find(
                      (option) => option.value === field.state.value
                    ) ?? null
                  }
                />
                <FieldError id={errorId} message={error?.message} />
              </div>
            );
          }}
        </form.Field>
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
