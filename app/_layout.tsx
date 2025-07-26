import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
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
      <RootLayoutNav />
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
