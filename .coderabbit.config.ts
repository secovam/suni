import { defineConfig } from "@coderabbitai/config";

const SOURCE_FILES = "{apps,packages}/**/*.{ts,tsx}";

const REACT_FILES = "{apps/web,packages/ui}/src/**/*.tsx";

const API_ROUTERS = "packages/api/src/routers/**/*.ts";

const WEB_COMPONENTS = "apps/web/src/**/*.tsx";

// One entry per guide: CodeRabbit both learns the file and holds matching paths to it.
const DOC_RULES = [
  {
    files: "docs/agents/typescript.md",
    applyTo: SOURCE_FILES,
    instructions:
      "Hold changed code to the rules in docs/agents/typescript.md.",
  },
  {
    files: "docs/agents/security-performance.md",
    applyTo: SOURCE_FILES,
    instructions:
      "Hold changed code to the rules in docs/agents/security-performance.md.",
  },
  {
    files: "docs/agents/react-accessibility.md",
    applyTo: REACT_FILES,
    instructions:
      "Hold changed code to the rules in docs/agents/react-accessibility.md.",
  },
  {
    files: "AGENTS.md",
    applyTo: "{**/AGENTS.md,docs/agents/**/*.md}",
    instructions:
      "Hold doc edits to the Documentation rules in AGENTS.md: keep only conventions, access rules, and traps hard to find in the source. Flag field or file catalogs, exact constants, narrated control flow, PR summaries, and text appended beside an outdated rule instead of replacing it.",
  },
] as const;

export default defineConfig({
  reviews: {
    high_level_summary: false,
    review_status: false,
    auto_review: {
      enabled: true,
    },
    pre_merge_checks: {
      docstrings: { mode: "off" },
    },
    path_filters: [
      // Vendored agent skills and generated files.
      "!.agents/**",
      "!skills-lock.json",
      "!apps/web/src/routeTree.gen.ts",
      "!packages/db/src/migrations/**",
      "!packages/ui/**",
    ],
    path_instructions: [
      ...DOC_RULES.map(({ applyTo, instructions }) => ({
        path: applyTo,
        instructions,
      })),
      {
        path: API_ROUTERS,
        instructions:
          "A mutation on a child entity (branch, contact) must check, in the same `UPDATE ... WHERE`, that neither it nor its parents are archived. State changes are one atomic `UPDATE ... WHERE ... RETURNING`, not a read followed by a write. Fields only admins may see are removed in the query, not hidden in the UI.",
      },
      {
        path: WEB_COMPONENTS,
        instructions:
          "UI copy and accessibility text (`aria-label`, `sr-only`, `title`) must be in Spanish. A flex container that holds a wide table needs `min-w-0`. When a dialog's trigger can disappear on close, set `finalFocus`.",
      },
    ],
  },
  knowledge_base: {
    code_guidelines: {
      filePatterns: DOC_RULES.map(({ files, applyTo }) => ({ files, applyTo })),
    },
  },
});
