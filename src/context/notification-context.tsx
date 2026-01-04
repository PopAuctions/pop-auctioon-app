import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';
import { registerForPushNotificationsAsync } from '@/utils/notifications/registerForPushNotifications';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { router } from 'expo-router';
import { getNotificationRouteFromResponse } from '@/utils/notifications/getNotificationRoute';
import { useAuth } from '@/context/auth-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';

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
        console.log(
          '🔔 App opened from notification (closed state):',
          response
        );

        // Navigate to route from notification
        const route = getNotificationRouteFromResponse(response);
        if (route) {
          console.log('🧭 Navigating to route from notification:', route);

          // 🔧 Fix for nested routes: Navigate to parent tab first
          setTimeout(() => {
            const parentTab = getParentTab(route);
            if (parentTab) {
              // It's a nested route - navigate to parent first
              console.log(
                '🔧 Nested route detected, navigating to parent:',
                parentTab
              );
              router.replace(parentTab as any);
              setTimeout(() => {
                router.push(route as any);
              }, 100);
            } else {
              // Direct navigation for top-level routes
              router.push(route as any);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('ERROR_GET_LAST_NOTIFICATION_RESPONSE', error);
      sentryErrorReport(error as Error, 'GET_LAST_NOTIFICATION_RESPONSE_ERROR');
    }

    // �📡 Function to register push token via backend API
    const registerPushToken = async (token: string, userId?: string) => {
      try {
        console.log('📡 Registering push token via backend...');

        // Build request data - include user_id only if provided
        const requestData: { token: string; user_id?: string } = { token };
        if (userId) {
          requestData.user_id = userId;
          console.log('📡 Registering with user_id:', userId);
        } else {
          console.log('📡 Registering without user_id (unauthenticated)');
        }

        const response = await protectedPost({
          endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER,
          data: requestData,
        });

        if (response.error) {
          console.log('ERROR_REGISTER_PUSH_TOKEN', response.error);
          sentryErrorReport(
            new Error(JSON.stringify(response.error)),
            'REGISTER_PUSH_TOKEN_ERROR'
          );
        } else {
          console.log('✅ Push token registered successfully');
        }
      } catch (error) {
        console.error('ERROR_REGISTER_PUSH_TOKEN_CATCH', error);
        sentryErrorReport(error as Error, 'REGISTER_PUSH_TOKEN_CATCH_ERROR');
      }
    };

    // Register for push notifications and get token
    registerForPushNotificationsAsync().then(
      (token) => {
        if (token && !hasRegisteredToken.current) {
          hasRegisteredToken.current = true; // Mark as registered
          setExpoPushToken(token);
          console.log('\n🎯 ============================================');
          console.log('📱 EXPO PUSH TOKEN (copy for testing):');
          console.log(token);
          console.log('🎯 ============================================\n');

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
        console.error('ERROR_REGISTER_PUSH_NOTIFICATIONS', error);
        sentryErrorReport(error, 'REGISTER_PUSH_NOTIFICATIONS_ERROR');
        setError(error);
      }
    );

    // Listener for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        try {
          console.log('🔔 Notification Received:', notification);
          setNotification(notification);

          // TODO: Handle notification based on type/data
          // Example: Navigate to specific screen based on notification data
          // if (notification.request.content.data?.type === 'auction') {
          //   router.push(`/(tabs)/auctions/${notification.request.content.data.auctionId}`);
          // }
        } catch (error) {
          console.error('ERROR_NOTIFICATION_RECEIVED_LISTENER', error);
          sentryErrorReport(
            error as Error,
            'NOTIFICATION_RECEIVED_LISTENER_ERROR'
          );
        }
      });

    // Listener for when user taps on a notification
    // 🎯 Handles: Foreground + Background scenarios
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          console.log('🔔 Notification Response (user tapped):', response);

          // Navigate to route from notification
          const route = getNotificationRouteFromResponse(response);
          if (route) {
            console.log('🧭 Navigating to route:', route);

            // 🔧 Fix for nested routes: Navigate to parent tab first to build proper stack
            // This ensures back button works and data loads correctly for ALL tabs
            const parentTab = getParentTab(route);
            if (parentTab) {
              // It's a nested route - navigate to parent first
              console.log(
                '🔧 Nested route detected, navigating to parent:',
                parentTab
              );
              router.replace(parentTab as any);
              setTimeout(() => {
                router.push(route as any);
              }, 100);
            } else {
              // Direct navigation for top-level routes
              router.push(route as any);
            }
          } else {
            console.log('⚠️ No route found in notification data');
          }
        } catch (error) {
          console.error('ERROR_NOTIFICATION_RESPONSE_LISTENER', error);
          sentryErrorReport(
            error as Error,
            'NOTIFICATION_RESPONSE_LISTENER_ERROR'
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
      console.log('🔄 User authenticated, updating push token with user_id...');

      const registerToken = async () => {
        try {
          console.log('📡 Registering push token via backend with user_id...');

          const response = await protectedPost({
            endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER,
            data: {
              token: expoPushToken,
              user_id: auth.session.user.id, // Include user_id to associate token
            },
          });

          if (response.error) {
            console.error('ERROR_REGISTER_PUSH_TOKEN', response.error);
            sentryErrorReport(
              new Error(JSON.stringify(response.error)),
              'REGISTER_PUSH_TOKEN_ERROR'
            );
          } else {
            console.log('✅ Push token registered with user_id successfully');
          }
        } catch (error) {
          console.error('ERROR_REGISTER_PUSH_TOKEN_CATCH', error);
          sentryErrorReport(error as Error, 'REGISTER_PUSH_TOKEN_CATCH_ERROR');
        }
      };

      registerToken();
    }
  }, [auth, expoPushToken, protectedPost]);

  // 🔄 Update token when app comes to foreground (Escenario 3: Abre app)
  useEffect(() => {
    if (!expoPushToken || auth.state !== 'authenticated') {
      return;
    }

    // TypeScript narrowing: We know auth.state is 'authenticated' here
    const userId = auth.session?.user?.id;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('🔄 App became active, updating token last_seen_at...');

        try {
          const requestData: { token: string; user_id?: string } = {
            token: expoPushToken,
          };

          // Include user_id if authenticated
          if (userId) {
            requestData.user_id = userId;
          }

          const response = await protectedPost({
            endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER,
            data: requestData,
          });

          if (response.error) {
            console.error('ERROR_UPDATE_TOKEN_ON_FOREGROUND', response.error);
          } else {
            console.log('✅ Token last_seen_at updated');
          }
        } catch (error) {
          console.error('ERROR_UPDATE_TOKEN_CATCH', error);
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
      console.log('🗑️ User logged out, disabling push token...');

      const disableToken = async () => {
        try {
          const response = await protectedPost({
            endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
            data: { token: expoPushToken },
          });

          if (response.error) {
            console.error('ERROR_DISABLE_PUSH_TOKEN', response.error);
            sentryErrorReport(
              new Error(JSON.stringify(response.error)),
              'DISABLE_PUSH_TOKEN_ERROR'
            );
          } else {
            console.log('✅ Push token disabled successfully');
            // Don't clear expoPushToken - keep it for potential reactivation
          }
        } catch (error) {
          console.error('ERROR_DISABLE_PUSH_TOKEN_CATCH', error);
          sentryErrorReport(error as Error, 'DISABLE_PUSH_TOKEN_CATCH_ERROR');
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
