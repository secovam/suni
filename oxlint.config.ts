import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";

const REACT_HOOK_FORM_BAN = {
  name: "react-hook-form",
  message: "Use TanStack Form with the Zod schemas from @suni/db/validation/*.",
};

const jsPlugins = selectJsPlugins(["github", "sonarjs", "react-doctor"]);

export default defineConfig({
  extends: [core, react, tanstack, tanstackJsPlugins, shadcn, jsPlugins],
  ignorePatterns: [
    // oxlint-disable-next-line typescript/no-non-null-assertion -- the ultracite preset types it as optional but always sets it
    ...core.ignorePatterns!,
    "packages/ui/**",
    "packages/db/src/migrations/**",
    ".agents/skills/**",
    ".claude/skills/**",
    "tools/oxlint/anti-slop/**",
    "tools/oxlint/suni/**",
  ],
  jsPlugins: [
    // oxlint-disable-next-line typescript/no-non-null-assertion -- the ultracite preset types it as optional but always sets it
    ...jsPlugins.jsPlugins!,
    // oxlint-disable-next-line typescript/no-non-null-assertion -- the shadcn preset types it as optional but always sets it
    ...shadcn.jsPlugins!,
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    { name: "suni", specifier: "./tools/oxlint/suni/index.ts" },
  ],
  options: { reportUnusedDisableDirectives: "error" },
  settings: jsPluginSettings,
  overrides: [
    {
      files: ["apps/web/src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [REACT_HOOK_FORM_BAN],
            patterns: [
              {
                group: ["@suni/auth", "@suni/auth/**"],
                message:
                  "@suni/auth is the server package. Use the client in @/lib/auth-client.",
              },
              {
                group: [
                  "@suni/db",
                  "@suni/db/**",
                  "!@suni/db/validation/*",
                  "!@suni/db/schema/*-enums",
                ],
                message:
                  "The web app must not pull table definitions or the DB client. Import shared rules from @suni/db/validation/* or enums from @suni/db/schema/*-enums.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["packages/db/src/index.ts", "packages/db/src/schema/index.ts"],
      rules: {
        "oxc/no-barrel-file": "off",
        "sonarjs/no-wildcard-import": "off",
      },
    },
    {
      files: ["packages/db/src/schema/**/*.ts"],
      rules: {
        "sort-keys": "off",
      },
    },
    {
      files: ["apps/web/src/routes/**/*.{ts,tsx}"],
      rules: {
        "func-style": "off",
        "github/filenames-match-regex": "off",
        "sonarjs/function-name": "off",
      },
    },
    {
      // CodeRabbit and pnpm require these exact filenames.
      files: [".coderabbit.config.ts", ".pnpmfile.cjs"],
      rules: {
        "github/filenames-match-regex": "off",
      },
    },
    {
      files: ["apps/web/src/components/**/*.{ts,tsx}"],
      rules: {
        "func-style": "off",
      },
    },
  ],
  rules: {
    "oxc/no-accumulating-spread": "error",
    "suni/require-suppression-reason": "error",
    "no-restricted-imports": ["error", { paths: [REACT_HOOK_FORM_BAN] }],
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    // Type predicates are the named-boundary pattern; no other way to write the check.
    "anti-slop/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-readable-spacing": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error",
    // Core rules that fight anti-slop (fix/break loops, contradictory advice).
    "typescript/consistent-indexed-object-style": "off",
    "unicorn/no-immediate-mutation": "off",
    "unicorn/prefer-reflect-apply": "off",
    "func-style": ["error", "declaration"],
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "function-declaration",
        unnamedComponents: "function-expression",
      },
    ],
  },
});
