import { useAtomValue } from "jotai";
import { entitlementAtom } from "../entitlement/entitlement-atom";

export function useHasFeature(feature: string) {
  const entitlements = useAtomValue(entitlementAtom);
  return entitlements.features.includes(feature);
}
