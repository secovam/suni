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

* Place reusable primitives in `src/components/` and import them as `@suni/ui/components/<name>`.
* Adjust shared design tokens in `src/styles/globals.css`.
* After `shadcn add`, restore `button.tsx`, `input.tsx` and `tooltip.tsx` from Git (they carry Suni variants), and translate any English labels the new component brings.
* Variant names are kebab-case (`outline-destructive`).
