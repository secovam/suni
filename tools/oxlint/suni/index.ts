import { definePlugin } from "@oxlint/plugins";

import noNullableText from "./rules/no-nullable-text.ts";
import preferRouterTypes from "./rules/prefer-router-types.ts";
import requireSellerScope from "./rules/require-seller-scope.ts";
import requireStringBound from "./rules/require-string-bound.ts";
import requireSuppressionReason from "./rules/require-suppression-reason.ts";

export default definePlugin({
  meta: { name: "suni" },
  rules: {
    "no-nullable-text": noNullableText,
    "prefer-router-types": preferRouterTypes,
    "require-seller-scope": requireSellerScope,
    "require-string-bound": requireStringBound,
    "require-suppression-reason": requireSuppressionReason,
  },
});
