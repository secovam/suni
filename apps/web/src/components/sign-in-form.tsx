import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { Label } from "@suni/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { FormEvent, ReactElement, ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const magicLinkSchema = z.object({
  email: z.email("Correo inválido"),
});

type MagicLinkValues = z.infer<typeof magicLinkSchema>;

interface SignInFormProps {
  authError?: string;
}

export default function SignInForm({
  authError,
}: SignInFormProps): ReactElement {
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);
  const [sentTo, setSentTo] = useState<string>("");

  const form = useForm({
    defaultValues: { email: "" } satisfies MagicLinkValues,
    onSubmit: async ({ value }: { value: MagicLinkValues }): Promise<void> => {
      try {
        const result = await authClient.signIn.magicLink({
          callbackURL: window.location.origin,
          email: value.email,
        });

        if (result.error) {
          toast.error("Error al enviar el enlace mágico");

          return;
        }

        setSentTo(value.email);
        setMagicLinkSent(true);
        toast.success("¡Enlace mágico enviado! Revisa tu correo electrónico.");
      } catch {
        toast.error("No pudimos enviar el enlace. Intenta de nuevo.");
      }
    },
    validators: { onSubmit: magicLinkSchema },
  });

  const errorMessage: ReactNode = authError ? (
    <div
      aria-live="polite"
      className="border-destructive/20 bg-destructive/10 text-destructive mb-6 rounded-md border p-3 text-sm"
      role="alert"
    >
      El enlace de acceso es incorrecto o ya expiró. Solicita uno nuevo para
      iniciar sesión.
    </div>
  ) : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void form.handleSubmit();
  };

  const handleResend = (): void => {
    setMagicLinkSent(false);
    setSentTo("");
    form.reset();
  };

  const authContent: ReactNode = magicLinkSent ? (
    <div className="space-y-4">
      <output
        aria-live="polite"
        className="border-primary/20 bg-primary/5 block w-full rounded-lg border px-4 py-3 text-sm"
      >
        <div className="space-y-1">
          <p className="text-foreground leading-5 font-medium">
            Revisa tu correo. Enviamos un enlace mágico a:
          </p>
          <p className="text-muted-foreground leading-5 wrap-break-word">
            <strong className="text-primary font-semibold break-all">
              {sentTo}
            </strong>
            .
          </p>
          <p className="text-muted-foreground text-xs">
            El enlace expira en 15 minutos.
          </p>
        </div>
      </output>
      <Button className="h-11 w-full" onClick={handleResend} variant="outline">
        Enviar otro enlace
      </Button>
    </div>
  ) : (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <form.Field name="email">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Inicia sesión con tu correo</Label>
              <Input
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                aria-invalid={hasError}
                autoComplete="email"
                className="h-11"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="tu.correo@dominio.com"
                spellCheck={false}
                type="email"
                value={field.state.value}
              />
              {hasError ? (
                <p
                  className="text-destructive text-sm"
                  id={`${field.name}-error`}
                  role="alert"
                >
                  {field.state.meta.errors[0]?.message}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({ isSubmitting: state.isSubmitting })}
      >
        {({ isSubmitting }) => (
          <Button className="h-11 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Enviando enlace…" : "Enviar enlace mágico"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );

  return (
    <main className="bg-background flex min-h-svh w-full items-center justify-center px-8">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Iniciar sesión en Gaia</h1>

        {errorMessage}
        {authContent}
      </div>
    </main>
  );
}
