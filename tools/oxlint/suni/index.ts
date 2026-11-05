import { definePlugin } from "@oxlint/plugins";

import requireSuppressionReason from "./rules/require-suppression-reason.ts";

export default definePlugin({
  meta: { name: "suni" },
  rules: {
    "require-suppression-reason": requireSuppressionReason,
  },
});
