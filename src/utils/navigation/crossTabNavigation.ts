import { TAB_ROUTES } from '@/components/navigation/routeConfig';

type CrossTabBackEntry = {
  originHref: string;
};

export type TabRoute = (typeof TAB_ROUTES)[number];

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

function normalizeTabsPath(pathname: string): string {
  if (pathname.startsWith('/(tabs)/')) return pathname;

  for (const tabRoute of TAB_ROUTES) {
    const tabName = tabRoute.replace('/(tabs)/', '');
    if (pathname === `/${tabName}` || pathname.startsWith(`/${tabName}/`)) {
      return `/(tabs)/${tabName}${pathname.slice(tabName.length + 1)}`;
    }
  }

  return pathname;
}

function getTabRootFromHref(href: string): TabRoute | null {
  const [pathNoQuery] = href.split('?');
  const clean = normalizeTabsPath(pathNoQuery);

  const match = TAB_ROUTES.find(
    (tabRoute) => clean === tabRoute || clean.startsWith(tabRoute + '/')
  );

  return match ?? null;
}

export function isCrossTabNestedNavigation(
  href: string,
  currentPathname: string
): boolean {
  const currentTab = getTabRootFromHref(currentPathname);
  const targetTab = getTabRootFromHref(href);

  if (!currentTab || !targetTab) return false;

  const [targetNoQuery] = href.split('?');
  const targetNormalized = normalizeTabsPath(targetNoQuery);
  const isTargetNested = targetNormalized !== targetTab;
  const isCrossTab = currentTab !== targetTab;

  return isCrossTab && isTargetNested;
}

export function getPathnameFromHref(href: string): string {
  const [pathNoQuery] = href.split('?');
  return stripRouteGroups(pathNoQuery);
}
