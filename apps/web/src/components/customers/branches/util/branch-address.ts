import type { AppRouterOutputs } from "@suni/api/routers/index";

export type Branch = AppRouterOutputs["branches"]["list"][number];

export function branchImageSrc(branch: Pick<Branch, "frontImageUrl">) {
  return branch.frontImageUrl || "/placeholder.webp";
}

export function formatAddress(branch: Branch) {
  const streetParts = [
    branch.street,
    branch.extNumber && `No. Ext. ${branch.extNumber}`,
    branch.intNumber && `No. Int. ${branch.intNumber}`,
    `Col. ${branch.suburb}`,
  ].filter(Boolean);

  return {
    streetLine: streetParts.join(", "),
    locationLine: `${branch.city}, ${branch.state}, CP ${branch.postalCode}`,
  };
}
