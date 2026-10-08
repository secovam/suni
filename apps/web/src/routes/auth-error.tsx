import { Button } from "@suni/ui/components/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { z } from "zod";

const searchSchema = z.object({
  error: z.string().optional(),
});

interface ErrorContent {
  title: string;
  description: string;
}

const DEFAULT_ERROR: ErrorContent = {
  description:
    "No pudimos validar tu enlace de acceso. Solicita uno nuevo para iniciar sesión.",
  title: "No pudimos iniciar tu sesión",
};

const ERROR_CONTENT = {
  ATTEMPTS_EXCEEDED: {
    description:
      "Este enlace ya se usó demasiadas veces. Solicita uno nuevo para continuar.",
    title: "Enlace agotado",
  },
  EXPIRED_TOKEN: {
    description:
      "Los enlaces de acceso duran 15 minutos. Solicita uno nuevo para iniciar sesión.",
    title: "El enlace expiró",
  },
  INVALID_TOKEN: {
    description:
      "El enlace es incorrecto o ya fue utilizado. Solicita uno nuevo para iniciar sesión.",
    title: "Enlace inválido",
  },
  new_user_signup_disabled: {
    description:
      "No encontramos una cuenta asociada a este enlace. Si crees que es un error, contacta al administrador.",
    title: "Cuenta no disponible",
  },
} satisfies Record<string, ErrorContent>;

type KnownErrorCode = keyof typeof ERROR_CONTENT;

function isKnownErrorCode(error: string): error is KnownErrorCode {
  return Object.hasOwn(ERROR_CONTENT, error);
}

function getErrorContent(error: string | undefined): ErrorContent {
  if (!error || !isKnownErrorCode(error)) {
    return DEFAULT_ERROR;
  }

  return ERROR_CONTENT[error];
}

export const Route = createFileRoute("/auth-error")({
  component: AuthErrorPage,
  validateSearch: searchSchema,
});

function AuthErrorPage(): ReactElement {
  const { error } = Route.useSearch();
  const navigate = useNavigate();
  const content = getErrorContent(error);

  const handleBack = (): void => {
    void navigate({ to: "/" });
  };

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
            {content.title}
          </h1>
          <p className="text-muted-foreground text-sm">{content.description}</p>
        </div>

        <Button className="h-11 w-full" onClick={handleBack}>
          Volver a iniciar sesión
        </Button>
      </div>
    </main>
  );
}
