# Suni agent guide

Suni manufactures cleaning and sanitation products for homes and businesses. This repo is Suni's internal operations system: inventory, orders, production, and related operations. The public company landing page will be added here later.

- Users are staff from four areas: administration, production (plant), warehouse, and sales.
- Access will be role-based, so each area sees only its own part of the system. The per-area role system is not built yet. Today Better Auth's admin plugin gives each user the `user` or `admin` role: `protectedProcedure` checks for a session, `scopedProcedure` adds `context.userId` and `context.admin` for handlers that branch on the role, and `adminProcedure` also requires `admin`. Non-admin sellers reach only their own customers and branches and the contacts under them. Until per-area roles exist, ask how a new route or procedure should be scoped instead of adding ad hoc role checks.
- Built so far: auth, admin user management, and the sales modules for customers, their branches, and their contacts.

This is a TypeScript monorepo with a React/Vite web app, a Hono/oRPC server, and shared UI, API, auth, and database packages.

- Package manager: `pnpm`. The `packageManager` and `scripts` fields in [package.json](package.json) own versions and root commands.
- Build all workspaces: `pnpm run build`.
- Check types across workspaces: `pnpm run check-types`.
- Pull requests: write the body with the sections of [.github/pull_request_template.md](.github/pull_request_template.md), in Spanish. `gh pr create --body` does not apply the template on its own.
- Dependencies: when a package already in `catalog:` of [pnpm-workspace.yaml](pnpm-workspace.yaml) is added to a workspace, use `catalog:` instead of a version.

## New domain module

The customers module is the reference implementation. Before building a new module, read it and copy its structure:

- Table in `packages/db/src/schema/<module>.ts`, enums in their own file when shared.
- Zod input rules in `packages/db/src/validation/<module>.ts`, used by both the API and the web form.
- Router in `packages/api/src/routers/<module>/`, one file per procedure, with prefix and tag set once in `index.ts`.
- Hooks in `apps/web/src/hooks/use-<module>.ts`, components in `apps/web/src/components/<module>/`, routes in `apps/web/src/routes/_auth/<module>/`.

Before writing code for a new module or a change that touches several packages, describe the plan (tables, procedures and who may call them, routes) to the user and wait for approval. Access scoping is not obvious yet (see the role note above).

When the user asks for tests (see [Verification by change](docs/agents/testing.md)):

- Use E2E tests as the testing mechanism, and use them to verify that complex features work. Each E2E run ends by producing a verifiable, repeatable artifact.
- Do not write unit tests after the code they cover.
- If a system must be tested in isolation, first write down every way it could fail, then write the code.

Read the guide relevant to the files you change:

- [Code quality and tooling](docs/agents/code-quality.md)
- [TypeScript and JavaScript](docs/agents/typescript.md)
- [React and accessibility](docs/agents/react-accessibility.md)
- [Security and performance](docs/agents/security-performance.md)
- [Verification by change](docs/agents/testing.md)

Choose context by task:

- Routes and queries: [web app](apps/web/AGENTS.md) and [API package](packages/api/AGENTS.md).
- Auth, sessions, or environment values: [server](apps/server/AGENTS.md), [auth](packages/auth/AGENTS.md), and [database](packages/db/AGENTS.md).
- Shared components or styles: [UI package](packages/ui/AGENTS.md) and [React guidance](docs/agents/react-accessibility.md).

## Hit every surface

A change is not done until it reaches every surface it touches. Before calling work done, walk this list and state which entries applied.

- Drizzle table and enums.
- Zod validation in `@suni/db/validation/*`, shared by the API and the form.
- oRPC procedure and its access scoping (`protectedProcedure`, `scopedProcedure`, or `adminProcedure`, per the role note above).
- Hook in `apps/web/src/hooks/`. Every successful mutation refreshes all oRPC queries (see `apps/web/src/utils/orpc.ts`), so hooks never list query keys.
- Route with loading, empty and error states.
- Reverse actions: archive needs unarchive, and a way in needs a way out and a way to see it.
- Nav items and actions hidden from users who cannot use them.
- Migration or `.env.schema` change needed? The user generates migrations, never you.
- Docs, only if existing guidance became inaccurate. Follow [Documentation](#documentation).

## Documentation

Most code changes need no doc change. Agents can read the code.

- `AGENTS.md` files and `docs/agents/` hold conventions, access rules, and traps that are hard to find in the source. Before adding a line, ask what an agent would get wrong without it. If the code answers it, leave it out.
- Do not list fields, procedures, constants, or files, narrate control flow, or append PR summaries. Anything that can drift will drift.
- A reason local to one spot goes in a short comment next to the code (4 lines at most). Link to source instead of copying it.
- When a documented rule changes, rewrite or remove the old text. Do not append a second account.
- Do not commit plans, research notes, or agent scratch files.

## Rules and what enforces them

When the operator corrects a repeated mistake, fix it and add a row here. If the rule was already here with no enforcer, that is a repeat: enforce it in the same change. Drop a row once its mistake can no longer be written.

| Rule | Enforced by |
| --- | --- |
| Hooks never list query keys to invalidate. | The `MutationCache` in `apps/web/src/utils/orpc.ts` |
| Customer and branch reads hide seller identity from non-admins. | `suni/require-seller-scope` |
| No unnecessary conditions or type assertions. | `pnpm run check:type-aware` (pre-push and CI) |
| No manual memoization. | React Compiler plus a `no-restricted-imports` ban |
| Effects only sync with systems outside React; each one says why in its suppression. | `suni/no-unreasoned-state-sync` |
| Comments say why, never what: no dividers, commented-out code, or name echoes, 4 lines at most. | `suni/no-low-value-comments` |
| Docs follow [Documentation](#documentation). | CodeRabbit on `AGENTS.md` and `docs/agents/**` |
| Web types come from `AppRouterInputs`/`AppRouterOutputs`, not hand-derived. | `suni/prefer-router-types` |
| Validation strings are bounded; text is never nullable. | `suni/require-string-bound`, `suni/no-nullable-text` |
| Zod schemas live in `@suni/db/validation/*`, not in components. | `no-restricted-imports` of `zod/**` in components |
| Forms use TanStack Form; the web never imports server packages. | `no-restricted-imports` |
| A mutation on a child entity checks, in the same `UPDATE ... WHERE`, that neither it nor its parents are archived. | Review only |
| UI copy and accessibility text (`aria-label`, `sr-only`, `title`) are in Spanish. | Review only |

## Context files

- [apps/web/AGENTS.md](apps/web/AGENTS.md) (web routes, client setup, and local commands)
- [apps/server/AGENTS.md](apps/server/AGENTS.md) (HTTP server, auth wiring, and local commands)
- [packages/api/AGENTS.md](packages/api/AGENTS.md) (oRPC procedures and request context)
- [packages/auth/AGENTS.md](packages/auth/AGENTS.md) (Better Auth setup)
- [packages/db/AGENTS.md](packages/db/AGENTS.md) (Drizzle schema and database commands)
- [packages/ui/AGENTS.md](packages/ui/AGENTS.md) (shared components and styles)
- [packages/config/AGENTS.md](packages/config/AGENTS.md) (shared TypeScript settings)
