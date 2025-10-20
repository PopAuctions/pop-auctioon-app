import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { PROTECTED_ROUTES } from '@/components/navigation/routeConfig';

export const useAuthNavigation = () => {
  const { getSession } = useAuth();
  const [session, role] = getSession();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateWithAuth = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      // Extraer ruta del href (ej: '/(tabs)/my-auctions' -> 'my-auctions')
      const routeParts = href.split('/');
      const routeName =
        routeParts[routeParts.length - 1] || routeParts[routeParts.length - 2];
      const routeConfig = PROTECTED_ROUTES[routeName];

      // Solo verificar autenticación si la ruta realmente lo requiere
      if (routeConfig && routeConfig.requiresAuth) {
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
        if (routeConfig.requiresRole && role !== routeConfig.requiresRole) {
          console.log(
            `🚫 Navigation blocked - Role ${role} insufficient for ${routeName} (requires ${routeConfig.requiresRole})`
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

      setIsNavigating(true);

      if (options?.replace) {
        router.replace(href as any);
      } else {
        router.push(href as any);
      }

      // Reset loading state after navigation
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);

      return true;
    },
    [session, role]
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
