import { definePlugin } from "@oxlint/plugins";

import requireSellerScope from "./rules/require-seller-scope.ts";
import requireSuppressionReason from "./rules/require-suppression-reason.ts";

export default definePlugin({
  meta: { name: "suni" },
  rules: {
    "require-seller-scope": requireSellerScope,
    "require-suppression-reason": requireSuppressionReason,
  },
});
