# Web app

## Overview

This workspace runs the React 19 and Vite web app. TanStack Router owns routes, and the app uses shared UI components and the oRPC client.

## Key files

| File                | Owns                          |
| ------------------- | ----------------------------- |
| `src/main.tsx`      | Router and query client setup |
| `src/routes/`       | File based routes             |
| `src/utils/orpc.ts` | oRPC client and query helpers |
| `.env.schema`       | Public environment values     |

## Commands

See [package.json](package.json) for available scripts. From the repo root, run one with `pnpm --filter web <script>`.

## Conventions

- You can import shared UI from `@suni/ui/components/*` and keep app specific components in `src/components/`.

## Generated files

- `src/routeTree.gen.ts` comes from `src/routes/` through the plugin in `vite.config.ts`. Edit route files and run `pnpm --filter web build` to regenerate it. The generated file is ignored by Git; do not edit it by hand.
- `src/env.ts` comes from `.env.schema`. Edit the schema, then run the root `env:generate` script in [package.json](../../package.json). Review the generated types rather than editing them by hand.
