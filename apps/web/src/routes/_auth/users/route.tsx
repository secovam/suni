import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/users")({
  beforeLoad: ({ context }) => {
    if (context.session.user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
});
