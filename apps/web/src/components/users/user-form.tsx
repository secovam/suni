import { zodResolver } from "@hookform/resolvers/zod";
import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Button } from "@suni/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@suni/ui/components/form";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateUser, useUpdateUser } from "@/hooks/use-users";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "Usuario" },
];

const userSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z.email({ message: "El correo no es válido" }),
  role: z.enum(["admin", "user"], { message: "El rol es requerido" }),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface FormUserProps {
  user?: AppRouterOutputs["users"]["get"];
}

export function FormUser({ user }: FormUserProps) {
  const router = useRouter();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const submitting = createUser.isPending || updateUser.isPending;

  const goToUsers = () => {
    router.navigate({ to: "/users" });
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role === "admin" ? "admin" : "user",
    },
  });

  function onSubmit(values: UserFormValues) {
    if (user) {
      updateUser.mutate({ id: user.id, ...values }, { onSuccess: goToUsers });
    } else {
      createUser.mutate(values, { onSuccess: goToUsers });
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre<span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Correo<span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="correo@secovam.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Rol del usuario<span className="text-destructive">*</span>
                </FormLabel>
                <ReactSelect
                  onChange={(option) => field.onChange(option?.value ?? "")}
                  options={ROLE_OPTIONS}
                  placeholder="Selecciona el rol del usuario..."
                  value={
                    ROLE_OPTIONS.find((opt) => opt.value === field.value) ??
                    null
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
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
    </Form>
  );
}
