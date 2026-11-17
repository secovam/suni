import { defineConfig } from "oxlint";

// Type-aware rules need the TypeScript program, so they run apart from `pnpm run check`
// (`pnpm run check:type-aware`). The preset's other type-aware rules stay off on purpose.
export default defineConfig({
  categories: { correctness: "off" },
  plugins: ["typescript"],
  options: { typeAware: true },
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "apps/web/src/routeTree.gen.ts",
    "packages/ui/**",
    "packages/db/src/migrations/**",
    ".agents/**",
    ".claude/**",
    "tools/**",
  ],
  rules: {
    "typescript/no-unnecessary-condition": "error",
    "typescript/no-unnecessary-type-assertion": "error",
  },
});
