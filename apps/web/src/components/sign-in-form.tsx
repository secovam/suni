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

export default function SignInForm(): ReactElement {
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);

  const form = useForm({
    defaultValues: { email: "" } satisfies MagicLinkValues,
    onSubmit: async ({ value }: { value: MagicLinkValues }): Promise<void> => {
      try {
        const result = await authClient.signIn.magicLink({
          callbackURL: window.location.origin,
          email: value.email,
          errorCallbackURL: `${window.location.origin}/auth-error`,
        });

        if (result.error) {
          toast.error("No pudimos enviar el enlace. Intenta de nuevo.");

          return;
        }

        setMagicLinkSent(true);
        toast.success(
          "Si existe una cuenta, recibirás un enlace en tu correo."
        );
      } catch {
        toast.error("No pudimos enviar el enlace. Intenta de nuevo.");
      }
    },
    validators: { onSubmit: magicLinkSchema },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void form.handleSubmit();
  };

  const handleResend = (): void => {
    setMagicLinkSent(false);
    form.reset();
  };

  const renderSentState = (): ReactNode => (
    <div className="space-y-4">
      <output
        aria-live="polite"
        className="border-primary/20 bg-primary/5 block w-full rounded-lg border px-4 py-3 text-sm"
      >
        <div className="space-y-1">
          <p className="text-foreground leading-5 font-medium">
            Si existe una cuenta con este correo, te enviamos un correo.
          </p>
        </div>
      </output>
      <Button className="h-11 w-full" onClick={handleResend} variant="outline">
        Enviar otro enlace
      </Button>
    </div>
  );

  const renderForm = (): ReactNode => (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <form.Field name="email">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          const errorId = `${field.name}-error`;

          let describedBy: string | undefined;
          let errorText: ReactNode = null;

          if (hasError) {
            describedBy = errorId;
            errorText = (
              <p className="text-destructive text-sm" id={errorId} role="alert">
                {field.state.meta.errors[0]?.message}
              </p>
            );
          }

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Inicia sesión con tu correo</Label>
              <Input
                aria-describedby={describedBy}
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
              {errorText}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({ isSubmitting: state.isSubmitting })}
      >
        {({ isSubmitting }) => {
          let label = "Enviar enlace mágico";

          if (isSubmitting) {
            label = "Enviando enlace…";
          }

          return (
            <Button
              className="h-11 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {label}
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );

  const renderAuthContent = (): ReactNode => {
    if (magicLinkSent) {
      return renderSentState();
    }

    return renderForm();
  };

  return (
    <main className="bg-background flex min-h-svh w-full items-center justify-center px-8">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Iniciar sesión en Suni</h1>

        {renderAuthContent()}
      </div>
    </main>
  );
}
