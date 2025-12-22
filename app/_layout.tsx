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
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import '../global.css';
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';

import { useColorScheme } from '@/hooks/ui/useColorScheme';
import SplashLottie from '@/components/loading/splash-lottie';
import * as Sentry from '@sentry/react-native';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import ErrorLoading from '@/components/loading/error-loading';
import { AuthProvider } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { DeepLinkListener } from '@/components/navigation/DeepLinkListener';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/providers/ToastProvider';
import { StripeProvider } from '@/providers/StripeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TranslationProvider } from '@/context/translation-context';

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

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
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

  const [showSplash, setShowSplash] = useState(true);
  const [fontError, setFontError] = useState<Error | null>(null);

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
    <TranslationProvider>
      <AuthProvider>
        <DeepLinkListener />
        <ProtectedRoute>
          <RootLayoutNav />
        </ProtectedRoute>
      </AuthProvider>
    </TranslationProvider>
  );
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StripeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
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
            <ToastProvider />
          </GestureHandlerRootView>
        </StripeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
