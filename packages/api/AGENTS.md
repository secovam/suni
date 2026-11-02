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
- Put each procedure in its own file under `src/routers/<module>/` and set `prefix` and `tag` once on the router in `index.ts`.
- Validate input with the shared schemas from `@suni/db/validation/*`; the web form and the API must enforce the same rules.
- When a response has fields only admins may see, select them out for other users in the query (see `routers/customers/list.ts`) instead of hiding them in the UI.
- Make state changes atomic: one `UPDATE ... WHERE ... RETURNING` that sets the target state, not a read followed by a write or a toggle. Throw `NOT_FOUND` when nothing was returned.
- Guard actions that would lock the caller out, such as an admin removing their own admin role.
- The server creates request context. This package consumes its typed session and database values.
