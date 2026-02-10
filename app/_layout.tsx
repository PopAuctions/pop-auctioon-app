import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
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
import * as WebBrowser from 'expo-web-browser';
import * as Notifications from 'expo-notifications';
import { NotificationProvider } from '@/context/notification-context';
import { disableFontScaling } from '@/utils/disableFontScaling';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SignInAlertModalProvider } from '@/context/sign-in-modal-context';
import { SignInAlertModal } from '@/components/modal/SignInAlertModal';

// Disable font scaling globally to maintain consistent design
disableFontScaling();

WebBrowser.maybeCompleteAuthSession();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // 🔔 shouldShowAlert: Show alert/banner when app is in foreground
    shouldShowAlert: true, // ✅ Shows banner at the top

    // 🔊 shouldPlaySound: Play notification sound
    shouldPlaySound: true, // ✅ Plays the sound configured in the channel

    // 🔴 shouldSetBadge: Update counter on app icon (iOS)
    shouldSetBadge: false, // ✅ Updates the badge number (e.g., red "3")

    // 📱 shouldShowBanner: Show heads-up banner (Android)
    shouldShowBanner: false, // ✅ Floating banner that appears over the app

    // 📋 shouldShowList: Add to notification list
    shouldShowList: true, // ✅ Appears in the notification panel
  }),
});

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
  const [fontsReady, setFontsReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  // Lock orientation to portrait immediately on mount
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        console.log('✅ [APP] Screen locked to PORTRAIT_UP');
      } catch (error) {
        console.error('❌ [APP] Failed to lock orientation:', error);
      }
    };

    lockOrientation();
  }, []);

  useEffect(() => {
    if (error) {
      sentryErrorReport(error, '[RootLayout] Font loading error');
      setFontError(error);
    }
  }, [error]);

  // Ocultar splash nativo cuando fuentes estén listas
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setFontsReady(true);
    }
  }, [loaded]);

  // Ocultar splash Lottie solo cuando AMBOS estén listos: fuentes Y animación
  useEffect(() => {
    if (fontsReady && animationFinished) {
      // Pequeño delay para transición suave
      const timeout = setTimeout(() => {
        setShowSplash(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [fontsReady, animationFinished]);

  if (fontError) {
    return <ErrorLoading />;
  }

  if (!loaded || showSplash) {
    return (
      <SplashLottie onAnimationFinish={() => setAnimationFinished(true)} />
    );
  }

  return (
    <TranslationProvider>
      <AuthProvider>
        <NotificationProvider>
          <SignInAlertModalProvider>
            <DeepLinkListener />
            <ProtectedRoute>
              <RootLayoutNav />
            </ProtectedRoute>
          </SignInAlertModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </TranslationProvider>
  );
});

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
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
            <SignInAlertModal />
            <ToastProvider />
          </GestureHandlerRootView>
        </StripeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
