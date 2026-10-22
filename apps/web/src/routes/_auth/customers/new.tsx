import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/customers/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello!</div>;
}
