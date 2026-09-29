# Auth package

## Overview

This package builds the Better Auth instance. The server passes its environment values and database to `createAuth`.

## Key files

| File | Owns |
| --- | --- |
| `src/index.ts` | Auth options, database adapter, and session type |
| `../db/src/schema/auth.ts` | Auth tables and relations |

## Commands

See [package.json](package.json) for package scripts. From the repo root, run one with `pnpm --filter @suni/auth <script>`. The root [package.json](../../package.json) owns `auth:generate`.

## Conventions

- Keep environment access in the server and pass the needed values to `createAuth`.
- Apply database schema changes through `@suni/db` after reviewing generated auth changes.

## Generated schema

Changes to auth plugins or schema options in `src/index.ts` may require regenerating `../db/src/schema/auth.ts` with the root `auth:generate` script. Review the diff before keeping it. That file also contains hand maintained relations, so preserve intentional edits outside the generated tables.
