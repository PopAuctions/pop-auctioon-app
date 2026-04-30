import { useCallback, useState } from 'react';
import { router, usePathname, type Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import {
  PROTECTED_ROUTES,
  normalizeRoutePath,
} from '@/components/navigation/routeConfig';
import {
  getPathnameFromHref,
  isCrossTabNestedNavigation,
  setCrossTabBackTarget,
} from '@/utils/navigation/crossTabNavigation';

export const useAuthNavigation = () => {
  const { getSession } = useAuth();
  const [session, role] = getSession();
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  const navigateWithAuth = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      const routeName = normalizeRoutePath(href);
      const routeConfig = PROTECTED_ROUTES[routeName];

      if (routeConfig) {
        if (!session) {
          router.replace('/(tabs)/auth');
          return false;
        }

        if (routeConfig.requiredRole && role !== routeConfig.requiredRole) {
          router.replace('/(tabs)/home');
          return false;
        }
      }

      const isCrossTabNested = isCrossTabNestedNavigation(href, pathname);

      if (isCrossTabNested) {
        const destinationPathname = getPathnameFromHref(href);
        setCrossTabBackTarget(destinationPathname, pathname);
      }

      setIsNavigating(true);

      if (options?.replace) {
        router.replace(href as Href);
      } else {
        router.push(href as Href);
      }

      setTimeout(() => {
        setIsNavigating(false);
      }, 500);

      return true;
    },
    [session, role, pathname]
  );

  return {
    navigateWithAuth,
    navigateToAuth: () => router.replace('/(tabs)/auth'),
    navigateToHome: () => router.replace('/(tabs)/home'),
    isNavigating,
    isAuthenticated: !!session,
    userRole: role,
  };
};
