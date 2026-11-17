import { defineRule } from "@oxlint/plugins";

import { chainedMethods } from "../shared/call-chain.ts";

const NULLABLE_METHODS = new Set(["nullable", "nullish"]);
const NOT_NULL_METHODS = ["notNull", "primaryKey", "references"];

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Store empty text as an empty string: no nullable Zod fields and no nullable text columns.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        // Zod: `.nullable()` / `.nullish()` anywhere in a validation file.
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          NULLABLE_METHODS.has(callee.property.name)
        ) {
          context.report({
            node: callee.property,
            message:
              'Do not make fields nullable: an empty value is `""`, so the form and the API share one schema.',
          });
          return;
        }

        // Drizzle: a `text(...)` column chain without `.notNull()`.
        if (callee.type !== "Identifier" || callee.name !== "text") return;

        const methods = chainedMethods(node);
        if (NOT_NULL_METHODS.some((name) => methods.includes(name))) return;

        context.report({
          node,
          message:
            'Text columns are `.notNull()`: store `""` instead of NULL (primary keys and foreign keys with `.references()` are the exception).',
        });
      },
    };
  },
});
