type CrossTabBackEntry = {
  originHref: string;
};

const crossTabBackMap = new Map<string, CrossTabBackEntry>();
const tabsToReset = new Set<string>();

function stripRouteGroups(path: string): string {
  return path.replace(/\/\([^)]+\)/g, '');
}

export function normalizeNavigationKey(path: string): string {
  const [pathNoQuery] = path.split('?');
  return stripRouteGroups(pathNoQuery);
}

export function setCrossTabBackTarget(
  destinationPathname: string,
  originHref: string
) {
  crossTabBackMap.set(normalizeNavigationKey(destinationPathname), {
    originHref,
  });
}

export function getCrossTabBackTarget(destinationPathname: string) {
  return (
    crossTabBackMap.get(normalizeNavigationKey(destinationPathname)) ?? null
  );
}

export function clearCrossTabBackTarget(destinationPathname: string) {
  crossTabBackMap.delete(normalizeNavigationKey(destinationPathname));
}

export function getTabRootFromPath(path: string): string | null {
  const normalized = normalizeNavigationKey(path);

  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  return `/${parts[0]}`;
}

export function markTabForReset(path: string) {
  const tabRoot = getTabRootFromPath(path);
  if (!tabRoot) return;

  tabsToReset.add(tabRoot);
}

export function shouldResetTab(path: string) {
  const tabRoot = getTabRootFromPath(path);
  if (!tabRoot) return false;

  return tabsToReset.has(tabRoot);
}

export function consumeTabReset(path: string) {
  const tabRoot = getTabRootFromPath(path);
  if (!tabRoot) return false;

  const hasReset = tabsToReset.has(tabRoot);
  if (hasReset) {
    tabsToReset.delete(tabRoot);
  }

  return hasReset;
}
