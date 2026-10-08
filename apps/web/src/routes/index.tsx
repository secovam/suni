import { createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactElement } from "react";

import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent(): ReactElement {
  return <SignInForm />;
}