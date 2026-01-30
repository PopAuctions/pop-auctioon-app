import React, { useEffect, useMemo } from 'react';
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

  const segmentsKey = useMemo(() => segments.join('/'), [segments]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)' && segments[1] === 'auth';

    const currentRoute = normalizeRoutePath(segmentsKey);
    const routeConfig = PROTECTED_ROUTES[currentRoute];

    if (auth.state === 'loading' || auth.state === 'pending') return;

    if (routeConfig) {
      if (auth.state !== 'authenticated') {
        router.replace('/(tabs)/auth');
        return;
      }

      if (routeConfig.requiredRole && auth.role == null) return;

      if (routeConfig.requiredRole && auth.role !== routeConfig.requiredRole) {
        console.log('[ProtectedRoute] redirecting due to insufficient role');
        router.replace('/(tabs)/home');
        return;
      }
    } else {
      // 🔇 don't log continuously in production/dev; log only on route change
      // (see the next snippet)
    }

    if (auth.state === 'authenticated' && inAuthGroup) {
      console.log(
        '[ProtectedRoute] redirecting authenticated user away from auth route'
      );
      router.replace('/(tabs)/home');
    }
  }, [auth, segments, segmentsKey, router]);

  return <>{children}</>;
};
