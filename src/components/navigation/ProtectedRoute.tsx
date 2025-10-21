import React, { useEffect } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { PROTECTED_ROUTES } from './routeConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)' && segments[1] === 'auth';

    // Extraer la ruta más específica (último segment válido)
    // Para '/(tabs)/account/about-us' -> 'about-us'
    // Para '/(tabs)/account' -> 'account'
    // Para '/(tabs)/auctions/calendar' -> 'calendar'
    const validSegments = segments.filter(
      (seg) => seg && !seg.includes('(') && !seg.includes(')')
    );
    const currentRoute = validSegments[validSegments.length - 1] ?? '';
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
      if (routeConfig.requiresRole && auth.role == null) {
        console.log(
          '⏳ Waiting for role before granting access to:',
          currentRoute
        );
        return;
      }

      if (routeConfig.requiresRole && auth.role !== routeConfig.requiresRole) {
        console.log(
          `🚫 Access denied - Role ${auth.role} insufficient for route ${currentRoute} (requires ${routeConfig.requiresRole})`
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
