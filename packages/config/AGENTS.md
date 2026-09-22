# Shared config package

## Overview

This workspace holds shared TypeScript settings. The server and shared packages extend its base config; the web app has its own TypeScript config.

## Key files

| File                 | Owns                    |
| -------------------- | ----------------------- |
| `tsconfig.base.json` | Shared compiler options |

## Conventions

- You can change `tsconfig.base.json` when a TypeScript rule should apply across workspaces. The root [package.json](../../package.json) owns the `check-types` command used to check the result.
