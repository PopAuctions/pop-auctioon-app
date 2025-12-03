import React, { useEffect } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { PROTECTED_ROUTES, normalizeRoutePath } from './routeConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)' && segments[1] === 'auth';

    // Normalizar la ruta completa para manejar parámetros dinámicos
    // Ejemplos:
    // - ['(tabs)', 'my-auctions', '28'] → 'my-auctions/[id]'
    // - ['(tabs)', 'account', 'edit-profile'] → 'edit-profile'
    // - ['(tabs)', 'auctions', 'live', '123'] → 'auctions/live/[id]'
    const fullPath = segments.join('/');
    const currentRoute = normalizeRoutePath(fullPath);
    const routeConfig = PROTECTED_ROUTES[currentRoute];

    if (auth.state === 'loading') return;

    if (routeConfig) {
      if (auth.state !== 'authenticated') {
        console.log(
          '🔒 Redirecting to auth - No session found for protected route:',
          currentRoute
        );
        router.replace('/(tabs)/auth');
        return;
      }

      // role gating (wait until role is resolved if required)
      if (routeConfig.requiredRole && auth.role == null) {
        console.log(
          '⏳ Waiting for role before granting access to:',
          currentRoute
        );
        return;
      }

      if (routeConfig.requiredRole && auth.role !== routeConfig.requiredRole) {
        console.log(
          `🚫 Access denied - Role ${auth.role} insufficient for route ${currentRoute} (requires ${routeConfig.requiredRole})`
        );
        router.replace('/(tabs)/home');
        return;
      }

      console.log(
        `✅ Access granted to ${currentRoute} for role=${auth.role ?? 'none'}`
      );
    } else {
      // Ruta pública - no requiere verificación
      if (currentRoute && !inAuthGroup) {
        console.log(
          '🌐 Public route detected in ProtectedRoute:',
          currentRoute
        );
      }
    }

    if (auth.state === 'authenticated' && inAuthGroup) {
      console.log('✅ Redirecting to home - Already authenticated');
      router.replace('/(tabs)/home');
    }
  }, [auth, segments, router]);

  return <>{children}</>;
};
