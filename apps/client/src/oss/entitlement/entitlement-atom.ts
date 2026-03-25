import { atom } from "jotai";

export type OssEntitlements = {
  tier: string;
  features: string[];
};

export const DEFAULT_ENTITLEMENTS: OssEntitlements = {
  tier: "free",
  features: [],
};

export const entitlementAtom = atom<OssEntitlements>(DEFAULT_ENTITLEMENTS);
