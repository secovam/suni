import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="grid min-h-svh place-items-center">
      <h1>Suni</h1>
    </main>
  );
}
