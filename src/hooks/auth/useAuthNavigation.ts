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
      // - '/(tabs)/my-auctions/28' → 'my-auctions/[id]'
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
        // Ruta pública - permitir navegación sin verificaciones
        console.log(
          '🌐 Public route, navigating without auth check:',
          routeName
        );
      }

      // 🔄 Auto-detect if we need to build navigation stack
      if (shouldBuildStack(href)) {
        const parentRoute = getParentRoute(href);

        if (parentRoute) {
          // Ya estamos en el padre → solo push, sin replace
          // usePathname() retorna sin grupos, ej: /auth vs /(tabs)/auth
          if (pathname === parentRoute.replace(/\/\([^)]+\)/g, '')) {
            router.push(href as Href);
            return true;
          }
          console.log('  Parent:', parentRoute);
          console.log('  Destination:', href);

          router.replace({
            pathname: parentRoute,
            params: { hideContent: 'true' },
          } as Href);
          setTimeout(() => {
            router.push(href as Href);
          }, 0);

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
