import { useCallback, useState } from 'react';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import {
  PROTECTED_ROUTES,
  normalizeRoutePath,
} from '@/components/navigation/routeConfig';

export const useAuthNavigation = () => {
  const { getSession } = useAuth();
  const [session, role] = getSession();
  const [isNavigating, setIsNavigating] = useState(false);

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
    [session, role]
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
