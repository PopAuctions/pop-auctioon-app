/**
 * 🗺️ Deep Link Navigation Stack Helper
 *
 * Determines if a deep link requires building a navigation stack by navigating
 * to the parent route first. This prevents "orphaned" screens where the back
 * button doesn't work.
 *
 * Based on the tab structure defined in app/(tabs)/_layout.tsx
 *
 * @example
 * getParentRoute("/(tabs)/account/edit-profile")
 * // → "/(tabs)/account"
 *
 * shouldBuildStack("/(tabs)/home")
 * // → false (root tab, no parent needed)
 */

/**
 * Tab routes that can have nested screens
 * Extracted from app/(tabs)/_layout.tsx
 */
const TAB_ROUTES = [
  'home',
  'auctions',
  'online-store',
  'auctioneer',
  'my-auctions',
  'my-online-store',
  'account',
  'auth',
] as const;

/**
 * Check if a path is a nested route under a tab
 *
 * @param path - The deep link path
 * @returns Parent tab route if nested, null otherwise
 *
 * @example
 * getParentRoute("/(tabs)/account/edit-profile") → "/(tabs)/account"
 * getParentRoute("/(tabs)/auctions/123") → "/(tabs)/auctions"
 * getParentRoute("/(tabs)/home") → null
 */
export function getParentRoute(path: string): string | null {
  // Remove leading slash and (tabs) prefix for easier parsing
  const normalizedPath = path.replace(/^\//, '').replace(/^\(tabs\)\//, '');

  // Check each tab route
  for (const tab of TAB_ROUTES) {
    // Pattern: tab/anything-else
    // e.g., "account/edit-profile", "auctions/123", "my-auctions/456"
    const pattern = new RegExp(`^${tab}/(.+)`);

    if (pattern.test(normalizedPath)) {
      return `/(tabs)/${tab}`;
    }
  }

  return null;
}

/**
 * Check if a deep link path requires building navigation stack
 *
 * @param path - The deep link path
 * @returns true if parent navigation is needed, false otherwise
 *
 * @example
 * shouldBuildStack("/(tabs)/account/edit-profile") → true
 * shouldBuildStack("/(tabs)/home") → false
 */
export function shouldBuildStack(path: string): boolean {
  return getParentRoute(path) !== null;
}
