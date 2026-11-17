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

const WEB_RESTRICTED_PATTERNS = [
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
];

const MANUAL_MEMO_BAN = {
  name: "react",
  importNames: ["useMemo", "useCallback", "memo"],
  message:
    "The React Compiler memoizes components in apps/web. Write plain code; do not memoize by hand.",
};

const ZOD_MESSAGE =
  "Components do not define schemas. Use the shared schema from @suni/db/validation/*; `import type { z }` is fine.";

const ZOD_VALUE_BAN = {
  name: "zod",
  allowTypeImports: true,
  message: ZOD_MESSAGE,
};

// Subpaths at any depth (`zod/v4`, `zod/v4/mini`, ...) build schemas just like the root import.
const ZOD_SUBPATH_BAN = {
  group: ["zod/**"],
  allowTypeImports: true,
  message: ZOD_MESSAGE,
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
            paths: [REACT_HOOK_FORM_BAN, MANUAL_MEMO_BAN],
            patterns: WEB_RESTRICTED_PATTERNS,
          },
        ],
        "suni/prefer-router-types": "error",
      },
    },
    {
      files: ["packages/db/src/validation/**/*.ts"],
      rules: { "suni/require-string-bound": "error" },
    },
    {
      files: [
        "packages/db/src/validation/**/*.ts",
        "packages/db/src/schema/**/*.ts",
      ],
      rules: { "suni/no-nullable-text": "error" },
    },
    {
      // auth:generate owns this file; its columns follow Better Auth, not our text rule.
      files: ["packages/db/src/schema/auth.ts"],
      rules: { "suni/no-nullable-text": "off" },
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
      // auth:generate writes `/* @__PURE__ */` annotations; keep its output byte-for-byte.
      files: ["packages/db/src/schema/auth.ts"],
      rules: {
        "no-inline-comments": "off",
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
        "no-restricted-imports": [
          "error",
          {
            paths: [REACT_HOOK_FORM_BAN, MANUAL_MEMO_BAN, ZOD_VALUE_BAN],
            patterns: [...WEB_RESTRICTED_PATTERNS, ZOD_SUBPATH_BAN],
          },
        ],
      },
    },
  ],
  rules: {
    "oxc/no-accumulating-spread": "error",
    // The QueryClient in apps/web/src/utils/orpc.ts invalidates every oRPC query after any mutation.
    "react-doctor/query-mutation-missing-invalidation": "off",
    "suni/require-seller-scope": "error",
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
