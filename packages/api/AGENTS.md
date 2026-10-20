# API package

## Overview

This package defines the oRPC procedures shared by the server and web app. Its context carries the Better Auth instance, request headers, current session, and database.

## Key files

| File                   | Owns                                            |
| ---------------------- | ----------------------------------------------- |
| `src/index.ts`         | Public, protected, and admin procedure builders |
| `src/context.ts`       | Context type                                    |
| `src/routers/index.ts` | App router, client, input, and output types     |
| `src/routers/users/`   | User management router, one file per procedure  |

## Commands

See [package.json](package.json) for available scripts. From the repo root, run one with `pnpm --filter @suni/api <script>`.

## Conventions

- Use `publicProcedure` for an open endpoint, `protectedProcedure` when a session is required, and `adminProcedure` when the user must have the `admin` role. `adminProcedure` reads the role from the database, not the cached session.
- Create and update users through the Better Auth admin API (`context.auth.api` with `context.headers`) rather than writing auth tables directly.
- Type web code with `AppRouterInputs` and `AppRouterOutputs` from `src/routers/index.ts` instead of redeclaring procedure shapes.
- The server creates request context. This package consumes its typed session and database values.
