import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '@/utils/notifications/registerForPushNotifications';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { router } from 'expo-router';
import { getNotificationRouteFromResponse } from '@/utils/notifications/getNotificationRoute';
import { useAuth } from '@/context/auth-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';

// AsyncStorage key for last known push token
const LAST_PUSH_TOKEN_KEY = '@lastExpoPushToken';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { auth } = useAuth();
  const { protectedPost } = useSecureApi();

  // Refs to prevent duplicate registrations
  const hasRegisteredToken = useRef(false);
  const previousAuthState = useRef<string | null>(null);
  const lastRegistrationTime = useRef<number>(0);
  const REGISTRATION_COOLDOWN_MS = 5000; // 5 seconds between registrations

  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined
  );

  useEffect(() => {
    // 🧭 Helper function to detect if route is nested and get parent tab
    const getParentTab = (route: string): string | null => {
      // Match pattern: /(tabs)/TABNAME/nested-route
      const tabMatch = route.match(/\/\(tabs\)\/([^\/]+)\/.+/);
      if (tabMatch && tabMatch[1]) {
        const tabName = tabMatch[1];
        // Return parent tab route
        return `/(tabs)/${tabName}`;
      }
      return null; // Not a nested route
    };

    // 🚀 Check if app was opened from a notification (when app was closed)
    try {
      const response = Notifications.getLastNotificationResponse();
      if (response) {
        const route = getNotificationRouteFromResponse(response);
        if (route) {
          setTimeout(() => {
            const parentTab = getParentTab(route);
            if (parentTab) {
              router.replace(parentTab as any);
              setTimeout(() => {
                router.push(route as any);
              }, 100);
            } else {
              router.push(route as any);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('ERROR_GET_LAST_NOTIFICATION_RESPONSE', error);
      sentryErrorReport(
        error as Error,
        '[NotificationContext.L104] getLastNotificationResponse - App opened from closed state'
      );
    }

    // �📡 Function to register push token via backend API
    const registerPushToken = async (token: string, userId?: string) => {
      try {
        // ⏱️ Throttle: Prevent registration spam (protect against TOO_MANY_REGISTRATIONS)
        const now = Date.now();
        if (now - lastRegistrationTime.current < REGISTRATION_COOLDOWN_MS) {
          console.log(
            '⏱️ Skipping token registration: Too soon since last registration'
          );
          return;
        }

        lastRegistrationTime.current = now;
        console.log('📡 Registering push token via backend...');

        // Build request data - include platform and user_id if provided
        const requestData: {
          token: string;
          platform: 'ios' | 'android' | 'web';
          user_id?: string;
        } = {
          token,
          platform: Platform.OS as 'ios' | 'android' | 'web',
        };

        if (userId) {
          requestData.user_id = userId;
        }

        const response = await protectedPost({
          endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER,
          data: requestData,
        });

        if (response.error) {
          sentryErrorReport(
            new Error(JSON.stringify(response.error)),
            '[NotificationContext.L127] registerPushToken - Initial token registration API error'
          );
        }
      } catch (error) {
        sentryErrorReport(
          error as Error,
          '[NotificationContext.L133] registerPushToken - Initial token registration catch'
        );
      }
    };

    // Register for push notifications and get token
    registerForPushNotificationsAsync().then(
      async (token) => {
        if (token && !hasRegisteredToken.current) {
          hasRegisteredToken.current = true; // Mark as registered
          setExpoPushToken(token);

          // 🔄 Check if token changed (reinstallation detection)
          try {
            const lastToken = await AsyncStorage.getItem(LAST_PUSH_TOKEN_KEY);

            if (lastToken && lastToken !== token) {
              const unregisterResponse = await protectedPost({
                endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
                data: { token: lastToken },
              });

              if (unregisterResponse.error) {
                sentryErrorReport(
                  new Error(JSON.stringify(unregisterResponse.error)),
                  '[NotificationContext.L161] AsyncStorage - Unregister old token after reinstall detection'
                );
              }

              hasRegisteredToken.current = false;
            }

            await AsyncStorage.setItem(LAST_PUSH_TOKEN_KEY, token);
          } catch (error) {
            sentryErrorReport(
              error as Error,
              '[NotificationContext.L171] AsyncStorage - Token change detection or save failed'
            );
          }

          // 📡 Register token via backend (with user_id if authenticated)
          if (auth.state === 'authenticated' && auth.session?.user?.id) {
            registerPushToken(token, auth.session.user.id);
          } else {
            // Register token without user_id (will be updated after login)
            registerPushToken(token);
          }
        }
      },
      (error) => {
        sentryErrorReport(
          error,
          '[NotificationContext.L183] registerForPushNotificationsAsync - Failed to get Expo push token'
        );
        setError(error);
      }
    );

    // Listener for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        try {
          setNotification(notification);
        } catch (error) {
          sentryErrorReport(
            error as Error,
            '[NotificationContext.L197] addNotificationReceivedListener - Foreground notification handling failed'
          );
        }
      });

    // Listener for when user taps on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const route = getNotificationRouteFromResponse(response);
          if (route) {
            const parentTab = getParentTab(route);
            if (parentTab) {
              router.replace(parentTab as any);
              setTimeout(() => {
                router.push(route as any);
              }, 100);
            } else {
              router.push(route as any);
            }
          }
        } catch (error) {
          sentryErrorReport(
            error as Error,
            '[NotificationContext.L219] addNotificationResponseReceivedListener - User tap navigation failed'
          );
        }
      });

    return () => {
      // Cleanup listeners on unmount
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [auth, protectedPost]);

  // 🔄 Register token when user authenticates (if token was obtained before login)
  useEffect(() => {
    if (
      expoPushToken &&
      auth.state === 'authenticated' &&
      auth.session?.user?.id
    ) {
      const registerToken = async () => {
        try {
          const response = await protectedPost({
            endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER,
            data: {
              token: expoPushToken,
              user_id: auth.session.user.id, // Include user_id to associate token
            },
          });

          if (response.error) {
            sentryErrorReport(
              new Error(JSON.stringify(response.error)),
              '[NotificationContext.L262] useEffect[auth] - Associate user_id after login API error'
            );
          }
        } catch (error) {
          sentryErrorReport(
            error as Error,
            '[NotificationContext.L268] useEffect[auth] - Associate user_id after login catch'
          );
        }
      };

      registerToken();
    }
  }, [auth, expoPushToken, protectedPost]);

  // 🔄 Update token when app comes to foreground (Escenario 3: Abre app)
  useEffect(() => {
    // Only run if we have a token (works for both authenticated and unauthenticated)
    if (!expoPushToken) {
      return;
    }

    // Get user_id if authenticated
    const userId =
      auth.state === 'authenticated' ? auth.session?.user?.id : undefined;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        try {
          const requestData: { token: string; user_id?: string } = {
            token: expoPushToken,
          };

          if (userId) {
            requestData.user_id = userId;
          }

          const response = await protectedPost({
            endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER,
            data: requestData,
          });

          if (response.error) {
            // Error already captured by Sentry in registerPushToken
          }
        } catch (error) {
          // Error already captured by Sentry
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [expoPushToken, auth, protectedPost]);

  // 🗑️ Disable token when user logs out (NOT delete - allows reactivation)
  useEffect(() => {
    // Only disable if we had a previous authenticated state
    // This prevents false logout detection during initial load
    const wasAuthenticated = previousAuthState.current === 'authenticated';
    const isNowUnauthenticated = auth.state === 'unauthenticated';

    // Update previous state
    previousAuthState.current = auth.state;

    // Detect actual logout: was authenticated, now is unauthenticated
    if (wasAuthenticated && isNowUnauthenticated && expoPushToken) {
      const disableToken = async () => {
        try {
          const response = await protectedPost({
            endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
            data: { token: expoPushToken },
          });

          if (response.error) {
            sentryErrorReport(
              new Error(JSON.stringify(response.error)),
              '[NotificationContext.L347] useEffect[logout] - Disable token on logout API error'
            );
          }
        } catch (error) {
          sentryErrorReport(
            error as Error,
            '[NotificationContext.L353] useEffect[logout] - Disable token on logout catch'
          );
        }
      };

      disableToken();
    }
  }, [auth.state, expoPushToken, protectedPost]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
