# Database package

## Overview

This package owns the Drizzle schema, relations, and database factory for PostgreSQL. The server passes `DATABASE_URL` to `createDb`.

## Key files

| File                | Owns                      |
| ------------------- | ------------------------- |
| `src/index.ts`      | Database factory and type |
| `src/schema/`       | Table definitions         |
| `src/relations.ts`  | Drizzle relations         |
| `drizzle.config.ts` | Migration settings        |

## Commands

See [package.json](package.json) for package scripts and the root [package.json](../../package.json) for database commands. From the repo root, run package scripts with `pnpm --filter @suni/db <script>`.

## Conventions

- Define tables in `src/schema/` and relations in `src/relations.ts`.
- The package `.env.schema` imports database values from `apps/server/.env.schema`.

## Generated files

- `src/env.ts` comes from `.env.schema`. Edit the local or imported server schema and run the root `env:generate` script; review generated types rather than editing them by hand.
- `src/schema/auth.ts` is the output target of the root `auth:generate` script. Review its diff after generation because the file also contains hand maintained relations. Database migrations come from the root `db:generate` script and should be reviewed before use.
