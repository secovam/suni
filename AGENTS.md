# Suni agent guide

Suni manufactures cleaning and sanitation products for homes and businesses. This repo is Suni's internal operations system: inventory, orders, production, and related operations. The public company landing page will be added here later.

- Users are staff from four areas: administration, production (plant), warehouse, and sales.
- Access will be role-based, so each area sees only its own part of the system. The role system is not built yet: `protectedProcedure` only checks for a session. Until it exists, ask how a new route or procedure should be scoped instead of adding ad hoc role checks.
- The domain modules are not built yet; today the code is the scaffold plus auth.

This is a TypeScript monorepo with a React/Vite web app, a Hono/oRPC server, and shared UI, API, auth, and database packages.

- Package manager: `pnpm`. The `packageManager` and `scripts` fields in [package.json](package.json) own versions and root commands.
- Build all workspaces: `pnpm run build`.
- Check types across workspaces: `pnpm run check-types`.
- Pull requests: write the body with the sections of [.github/pull_request_template.md](.github/pull_request_template.md), in Spanish. `gh pr create --body` does not apply the template on its own.

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

## Context files

- [apps/web/AGENTS.md](apps/web/AGENTS.md) (web routes, client setup, and local commands)
- [apps/server/AGENTS.md](apps/server/AGENTS.md) (HTTP server, auth wiring, and local commands)
- [packages/api/AGENTS.md](packages/api/AGENTS.md) (oRPC procedures and request context)
- [packages/auth/AGENTS.md](packages/auth/AGENTS.md) (Better Auth setup)
- [packages/db/AGENTS.md](packages/db/AGENTS.md) (Drizzle schema and database commands)
- [packages/ui/AGENTS.md](packages/ui/AGENTS.md) (shared components and styles)
- [packages/config/AGENTS.md](packages/config/AGENTS.md) (shared TypeScript settings)
