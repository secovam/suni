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
- Put oRPC queries and mutations in `src/hooks/` and have mutations await query invalidation. Load a single record for a route in its `loader`.
- Build forms with TanStack Form (`@tanstack/react-form`) and Zod.
- Use `Link` for buttons that only navigate.

## Generated files

- `src/routeTree.gen.ts` comes from `src/routes/` through the plugin in `vite.config.ts`. Edit route files and run `pnpm --filter web build` to regenerate it. The generated file is ignored by Git; do not edit it by hand.
- `src/env.ts` comes from `.env.schema`. Edit the schema, then run the root `env:generate` script in [package.json](../../package.json). Review the generated types rather than editing them by hand.
