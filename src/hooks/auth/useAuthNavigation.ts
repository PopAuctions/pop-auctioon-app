import { useCallback, useState } from 'react';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import {
  PROTECTED_ROUTES,
  normalizeRoutePath,
} from '@/components/navigation/routeConfig';
import {
  shouldBuildStack,
  getParentRoute,
} from '@/utils/deeplinks/getParentRoute';

export const useAuthNavigation = () => {
  const { getSession } = useAuth();
  const [session, role] = getSession();
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Smart navigation with auto-detection of stack building needs
  const navigateWithAuth = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      // Normalizar la ruta para manejar parámetros dinámicos
      // Ejemplos:
      // - '/(tabs)/auctioneer/my-auctions/28' → 'my-auctions/[id]'
      // - '/(tabs)/account/edit-profile' → 'edit-profile'
      const routeName = normalizeRoutePath(href);
      const routeConfig = PROTECTED_ROUTES[routeName];

      // Si la ruta está en PROTECTED_ROUTES, requiere autenticación
      if (routeConfig) {
        // Verificar que hay sesión para rutas protegidas
        if (!session) {
          console.log(
            '🔒 Navigation blocked - No session for protected route:',
            routeName
          );
          router.replace('/(tabs)/auth');
          return false;
        }

        // Verificar rol específico si es requerido
        if (routeConfig.requiredRole && role !== routeConfig.requiredRole) {
          console.log(
            `🚫 Navigation blocked - Role ${role} insufficient for ${routeName} (requires ${routeConfig.requiredRole})`
          );
          router.replace('/(tabs)/home');
          return false;
        }
      } else {
        console.log(
          '🌐 Public route, navigating without auth check:',
          routeName
        );
      }

      // ✅ If destination is in a different tab and is a nested route,
      // do NOT "build stack" (replace parent + push) because it causes a visible double transition.
      // Navigate directly to the final route instead (single transition).
      if (shouldBuildStack(href)) {
        const parentRoute = getParentRoute(href);

        if (parentRoute) {
          const normalizedParent = parentRoute.replace(/\/\([^)]+\)/g, '');
          const isSameStack = pathname === normalizedParent;

          if (isSameStack) {
            // Same stack → keep existing behavior
            router.push(href as Href);
            return true;
          }

          // Different stack (usually another tab) → avoid stack building
          setIsNavigating(true);

          if (options?.replace) {
            router.replace(href as Href);
          } else {
            // navigate avoids stacking extra history across tabs and is a single transition
            router.navigate(href as Href);
          }

          setTimeout(() => {
            setIsNavigating(false);
          }, 500);

          return true;
        }
      }

      setIsNavigating(true);

      // Direct navigation for same-stack or root routes
      if (options?.replace) {
        router.replace(href as Href);
      } else {
        router.push(href as Href);
      }

      // Reset loading state after navigation
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);

      return true;
    },
    [session, role, pathname]
  );

  const navigateToAuth = useCallback(() => {
    router.replace('/(tabs)/auth');
  }, []);

  const navigateToHome = useCallback(() => {
    router.replace('/(tabs)/home');
  }, []);

  return {
    navigateWithAuth,
    navigateToAuth,
    navigateToHome,
    isNavigating,
    isAuthenticated: !!session,
    userRole: role,
  };
};
