import { Button } from "@suni/ui/components/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

const ERROR_MESSAGE =
  "No pudimos validar tu enlace de acceso. Solicita uno nuevo para iniciar sesión.";

export const Route = createFileRoute("/auth-error")({
  component: AuthErrorPage,
});

function AuthErrorPage() {
  const navigate = useNavigate();

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
          <p className="text-muted-foreground text-sm">{ERROR_MESSAGE}</p>
        </div>

        <Button className="h-11 w-full" onClick={() => navigate({ to: "/" })}>
          Volver a iniciar sesión
        </Button>
      </div>
    </main>
  );
}
