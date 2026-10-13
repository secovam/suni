import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/users/$userId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello !</div>;
}
