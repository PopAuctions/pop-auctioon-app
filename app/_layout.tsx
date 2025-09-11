import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';

import { useColorScheme } from '@/hooks/useColorScheme';
import SplashLottie from '@/components/loading/splash-lottie';
import { supabase } from '@/utils/supabase/supabase-store';
import { Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';
import { getUserRole } from '@/lib/auth/get-user-role';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import ErrorLoading from '@/components/loading/error-loading';
import { AuthContext } from '@/context/auth-context';
import { UserRoles } from '@/types/types';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  beforeSend(event) {
    // Remove sensitive data from the event
    if (event.request) {
      delete event.request.headers?.Authorization;
    }
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
  release: process.env.EXPO_PUBLIC_SENTRY_RELEASE || 'unknown',
});

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Rubik_400Regular,
    Rubik_700Bold,
    ...FontAwesome.font,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRoles | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [fontError, setFontError] = useState<Error | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        sentryErrorReport(error, '[RootLayout] Error getting session');
        return;
      }
      setSession(data.session);
      if (!data.session?.user) {
        setRole(null);
        return;
      }
      const userRole = await getUserRole({ id: data.session.user.id });
      setRole(userRole.role);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (!session?.user) {
          setRole(null);
          return;
        }
        const userRole = await getUserRole({ id: session.user.id });
        setRole(userRole.role ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Deep linking handler
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      // Ignorar URLs de desarrollo
      if (url.includes('expo-development-client')) {
        return;
      }
      console.log('🔗 Deep link received:', url);

      // Parsear URL y manejar navegación basada en auth
      if (url.includes('/account') && !session) {
        console.log(
          '🔒 Deep link to protected route without auth, redirecting to login'
        );
        // No redirigir aquí, dejamos que ProtectedRoute lo maneje
      } else if (url.includes('/auth') && session) {
        console.log(
          '✅ Deep link to auth with existing session, redirecting to home'
        );
        // No redirigir aquí, dejamos que ProtectedRoute lo maneje
      }
    };

    // Escuchar eventos de deep linking
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Manejar URL inicial (cuando la app se abre desde un link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [session]);

  useEffect(() => {
    if (error) {
      sentryErrorReport(error, '[RootLayout] Font loading error');
      setFontError(error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      const timeout = setTimeout(() => {
        setShowSplash(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  if (fontError) {
    return <ErrorLoading />;
  }

  if (!loaded || showSplash) {
    return <SplashLottie />;
  }

  return (
    <AuthContext.Provider value={{ session, role }}>
      <ProtectedRoute>
        <RootLayoutNav />
      </ProtectedRoute>
    </AuthContext.Provider>
  );
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name='(tabs)'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='modal'
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
