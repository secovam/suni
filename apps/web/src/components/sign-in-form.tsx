import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { Label } from "@suni/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

function SentConfirmation({ onResend }: { onResend: () => void }) {
  return (
    <div className="space-y-4">
      <output
        aria-live="polite"
        className="border-primary/20 bg-primary/5 block w-full rounded-lg border px-4 py-3 text-sm"
      >
        <p className="text-foreground leading-5 font-medium">
          Si existe una cuenta con este correo, te enviamos un correo.
        </p>
      </output>
      <Button className="h-11 w-full" onClick={onResend} variant="outline">
        Enviar otro enlace
      </Button>
    </div>
  );
}

function EmailSignInForm({ onSent }: { onSent: () => void }) {
  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }): Promise<void> => {
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

        onSent();
        toast.success(
          "Si existe una cuenta, recibirás un enlace en tu correo."
        );
      } catch {
        toast.error("No pudimos enviar el enlace. Intenta de nuevo.");
      }
    },
    validators: { onSubmit: z.object({ email: z.email("Correo inválido") }) },
  });

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit}>
      <form.Field name="email">
        {(field) => {
          const [error] = field.state.meta.errors;
          const errorId = `${field.name}-error`;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Inicia sesión con tu correo</Label>
              <Input
                aria-describedby={error && errorId}
                aria-invalid={Boolean(error)}
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
              {error && (
                <p
                  className="text-destructive text-sm"
                  id={errorId}
                  role="alert"
                >
                  {error.message}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({ isSubmitting: state.isSubmitting })}
      >
        {({ isSubmitting }) => (
          <Button className="h-11 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Enviando enlace..." : "Enviar enlance mágico"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default function SignInForm() {
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  return (
    <main className="bg-background flex min-h-svh w-full items-center justify-center px-8">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Iniciar sesión en Suni</h1>
        {magicLinkSent && (
          <SentConfirmation onResend={() => setMagicLinkSent(false)} />
        )}
        {!magicLinkSent && (
          <EmailSignInForm onSent={() => setMagicLinkSent(true)} />
        )}
      </div>
    </main>
  );
}
