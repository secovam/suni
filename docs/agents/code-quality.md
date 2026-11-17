# Code quality and tooling

The repository uses Ultracite with Oxlint and Oxfmt. Treat `oxlint.config.ts` and `oxfmt.config.ts` as the source of truth for enforced rules and formatting.

- Run `pnpm run check` to check lint and formatting; run `pnpm run fix` to apply available fixes.
- Before committing code changes, run `pnpm run fix` and review the resulting diff. Before pushing, run `pnpm run check:changed` (lint and format, type-aware lint, types for affected packages, knip).
- For named functions, follow the declaration style required by `oxlint.config.ts`. Use arrow functions for callbacks. The config has scoped exceptions for web routes and components.
- Name complex conditions, use early returns for error cases, and avoid nested ternaries.
- Remove `console.log`, `debugger`, and `alert` from production code.
- `pnpm run check:type-aware` runs the type-aware rules (`no-unnecessary-condition`, `no-unnecessary-type-assertion`) with `oxlint-type-aware.config.ts`. It also runs in CI and on pre-push.
