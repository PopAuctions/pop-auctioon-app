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

export default function RootLayout() {
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        // Adaptación de tu consulta web para obtener el usuario que no sea admin
        supabase
          .from('User')
          .select('role')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data }) => setRole(data?.role ?? null));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          supabase
            .from('User')
            .select('role')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => setRole(data?.role ?? null));
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      const timeout = setTimeout(() => setShowSplash(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  if (!loaded || showSplash) {
    return <SplashLottie />;
  }

  // Pasa session y role como props/context a las tabs
  return (
    <RootLayoutNav
      session={session}
      role={role}
    />
  );
}

function RootLayoutNav({
  session,
  role,
}: {
  session: Session | null;
  role: string | null;
}) {
  const colorScheme = useColorScheme();

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
