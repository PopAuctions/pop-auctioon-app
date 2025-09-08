import React, { useEffect } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { PROTECTED_ROUTES } from './routeConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Verificar si estamos en el grupo de autenticación
    const inAuthGroup = segments[0] === '(tabs)' && segments[1] === 'auth';

    const currentRoute = segments[1];
    const routeConfig = PROTECTED_ROUTES[currentRoute || ''];

    if (routeConfig) {
      // Verificar autenticación
      if (!session) {
        console.log(
          '🔒 Redirecting to auth - No session found for protected route:',
          currentRoute
        );
        router.replace('/(tabs)/auth');
        return;
      }

      // Verificar rol específico si es requerido
      if (routeConfig.requiresRole && role !== routeConfig.requiresRole) {
        console.log(
          `🚫 Access denied - Role ${role} insufficient for route ${currentRoute} (requires ${routeConfig.requiresRole})`
        );
        router.replace('/(tabs)/home');
        return;
      }

      console.log(`✅ Access granted to ${currentRoute} for ${role} user`);
    }

    // Si ya está loggeado y está en auth, redirigir a home
    if (session && inAuthGroup) {
      console.log('✅ Redirecting to home - Already authenticated');
      router.replace('/(tabs)/home');
    }
  }, [session, role, segments, router]);

  return <>{children}</>;
};
