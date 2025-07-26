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

import { useColorScheme } from '@/components/useColorScheme';
import SplashLottie from '@/components/loading/splash-lottie';
import { supabase } from '@/utils/supabase/supabase-store';
import { Session } from '@supabase/supabase-js';
import { UserRoles } from '@/types/types';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://6ae0a34d10b492672ef28a83855f994e@o4507746597994496.ingest.de.sentry.io/4509673933045840',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

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
  const [role, setRole] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('[RootLayout] useEffect: getSession');
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('[RootLayout] Error getting session:', error);
      }
      setSession(data.session);
      console.log('[RootLayout] Session from getSession:', data.session);
      if (data.session?.user) {
        supabase
          .from('User')
          .select('role')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('[RootLayout] Error fetching role:', error);
            }
            console.log('[RootLayout] Role from getSession:', data?.role);
            setRole(data?.role ?? null);
          });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('[RootLayout] Auth state changed:', session);
        setSession(session);
        if (session?.user) {
          supabase
            .from('User')
            .select('role')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error(
                  '[RootLayout] Error fetching role on auth change:',
                  error
                );
              }
              console.log('[RootLayout] Role from auth change:', data?.role);
              setRole(data?.role ?? null);
            });
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      console.log('[RootLayout] Cleanup: unsubscribing auth listener');
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error('[RootLayout] Font loading error:', error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log('[RootLayout] Fonts loaded, hiding splash');
      SplashScreen.hideAsync();
      const timeout = setTimeout(() => {
        console.log('[RootLayout] Splash timeout finished');
        setShowSplash(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  if (!loaded || showSplash) {
    console.log('[RootLayout] Showing SplashLottie');
    return <SplashLottie />;
  }

  console.log(
    '[RootLayout] Rendering RootLayoutNav with session:',
    session,
    'role:',
    role
  );
  return (
    <RootLayoutNav
      session={session}
      role={role}
    />
  );
});

function RootLayoutNav({
  session,
  role,
}: {
  session: Session | null;
  role: string | null;
}) {
  const colorScheme = useColorScheme();

  console.log('[RootLayoutNav] session:', session, 'role:', role);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name='(tabs)'
          options={{ headerShown: false }}
          initialParams={{ session, role }}
        />
        <Stack.Screen
          name='modal'
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}