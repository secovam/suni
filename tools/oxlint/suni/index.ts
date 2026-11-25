import { definePlugin } from "@oxlint/plugins";

import noLowValueComments from "./rules/no-low-value-comments.ts";
import noNullableText from "./rules/no-nullable-text.ts";
import noUnreasonedStateSync from "./rules/no-unreasoned-state-sync.ts";
import preferRouterTypes from "./rules/prefer-router-types.ts";
import requireSellerScope from "./rules/require-seller-scope.ts";
import requireStringBound from "./rules/require-string-bound.ts";
import requireSuppressionReason from "./rules/require-suppression-reason.ts";

export default definePlugin({
  meta: { name: "suni" },
  rules: {
    "no-low-value-comments": noLowValueComments,
    "no-nullable-text": noNullableText,
    "no-unreasoned-state-sync": noUnreasonedStateSync,
    "prefer-router-types": preferRouterTypes,
    "require-seller-scope": requireSellerScope,
    "require-string-bound": requireStringBound,
    "require-suppression-reason": requireSuppressionReason,
  },
});
