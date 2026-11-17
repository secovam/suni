import { defineRule } from "@oxlint/plugins";

import { chainedMethods } from "../shared/call-chain.ts";

const BOUNDING_METHODS = new Set(["max", "length", "regex"]);

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require every z.string() to set its own limit with .max(), .length() or .regex().",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        if (
          callee.type !== "MemberExpression" ||
          callee.object.type !== "Identifier" ||
          callee.object.name !== "z" ||
          callee.property.type !== "Identifier" ||
          callee.property.name !== "string"
        )
          return;

        const methods = chainedMethods(node);
        // After `.array()`, `.max()` and `.length()` bound the array, not the string.
        const arrayAt = methods.indexOf("array");
        const stringMethods =
          arrayAt === -1 ? methods : methods.slice(0, arrayAt);
        if (stringMethods.some((name) => BOUNDING_METHODS.has(name))) return;

        context.report({
          node,
          message:
            "Every field defines its own limit: add `.max(n)`, `.length(n)` or `.regex(...)` to this z.string(). `.min(1)` alone is not a bound.",
        });
      },
    };
  },
});
