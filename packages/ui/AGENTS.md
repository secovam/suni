# UI package

## Overview

This package holds shared React components and global styles. The web app imports components through the package exports.

## Key files

| File | Owns |
|---|---|
| `src/components/` | Shared components |
| `src/styles/globals.css` | Design tokens and global styles |
| `components.json` | shadcn paths for this package |

## Commands

See [package.json](package.json) for available scripts. From the repo root, run one with `pnpm --filter @suni/ui <script>`.

## Conventions

* You can place reusable primitives in `src/components/` and import them as `@suni/ui/components/<name>`.
* You can adjust shared design tokens in `src/styles/globals.css`.
