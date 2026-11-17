# Web app

## Overview

This workspace runs the React 19 and Vite web app. TanStack Router owns routes, and the app uses shared UI components and the oRPC client.

## Key files

| File | Owns |
| --- | --- |
| `src/main.tsx` | Router and query client setup |
| `src/routes/` | File based routes |
| `src/routes/_auth/route.tsx` | Session guard and sidebar layout for signed-in pages |
| `src/hooks/` | Query and mutation hooks |
| `src/utils/orpc.ts` | oRPC client and query helpers |
| `.env.schema` | Public environment values |

## Commands

See [package.json](package.json) for available scripts. From the repo root, run one with `pnpm --filter web <script>`.

## Conventions

- Import shared UI from `@suni/ui/components/*`; keep app-specific components in `src/components/`, grouped by feature (for example `src/components/users/`).
- Put oRPC queries and mutations in `src/hooks/`. Do not invalidate queries in a hook: the `QueryClient` in `src/utils/orpc.ts` refreshes every oRPC query after any successful mutation. Load a single record for a route in its `loader`.
- Name hooks verb plus resource (`useListCustomers`, `useCreateCustomer`). Type data with `AppRouterInputs` and `AppRouterOutputs`, never by redeclaring shapes.
- Build forms with TanStack Form (`@tanstack/react-form`) and the Zod schemas from `@suni/db/validation/*`. Do not use react-hook-form.
- Use `Link` for buttons that only navigate.
- Every page that fetches data renders loading, empty, and error states.
- Hide navigation and actions the current user cannot use, matching the procedure each one calls (`useIsAdmin` for admin-only ones).
- Keep a component's props type, constants, and labels in the same file as the component.
- The React Compiler is on. Do not use `useMemo`, `useCallback` or `memo`; lint rejects them.
- A flex container that holds a wide table needs `min-w-0`, or the table stretches the page.
- When a dialog's trigger can disappear on close (it is archived, removed or filtered out), set `finalFocus` so focus lands somewhere sensible.

## Generated files

- `src/routeTree.gen.ts` comes from `src/routes/` through the plugin in `vite.config.ts`. Edit route files and run `pnpm --filter web build` to regenerate it. The generated file is ignored by Git; do not edit it by hand.
- `src/env.ts` comes from `.env.schema`. Edit the schema, then run the root `env:generate` script in [package.json](../../package.json). Review the generated types rather than editing them by hand.
