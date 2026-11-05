import { Button } from "@suni/ui/components/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ERROR_MESSAGE =
  "No pudimos validar tu enlace de acceso. Solicita uno nuevo para iniciar sesión.";

const ERROR_MESSAGES = new Map([
  [
    "INVALID_TOKEN",
    "Este enlace de acceso venció o ya no es válido. Solicita uno nuevo para iniciar sesión.",
  ],
  [
    "BANNED_USER",
    "Tu acceso a Suni está suspendido. Si crees que es un error, contacta a un administrador.",
  ],
]);

export const Route = createFileRoute("/auth-error")({
  component: AuthErrorPage,
  validateSearch: z.object({ error: z.string().optional() }),
});

function AuthErrorPage() {
  const { error } = Route.useSearch();

  const authError = ERROR_MESSAGES.get(error ?? "") ?? ERROR_MESSAGE;

  return (
    <main className="bg-background flex min-h-svh w-full items-center justify-center px-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2" role="alert">
          <img
            alt="Error"
            className="mx-auto h-auto w-full max-w-80"
            src="/error-suni.png"
          />
          <h1 className="text-foreground text-xl font-semibold">
            No pudimos iniciar tu sesión
          </h1>
          <p className="text-muted-foreground text-sm">{authError}</p>
        </div>

        <Button
          className="h-11 w-full"
          nativeButton={false}
          render={<Link to="/" />}
        >
          Volver a iniciar sesión
        </Button>
      </div>
    </main>
  );
}
