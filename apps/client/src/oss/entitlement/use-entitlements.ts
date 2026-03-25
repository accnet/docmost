import { DEFAULT_ENTITLEMENTS } from "./entitlement-atom";

export function useEntitlements() {
  return {
    data: DEFAULT_ENTITLEMENTS,
    isLoading: false,
    isError: false,
  };
}
