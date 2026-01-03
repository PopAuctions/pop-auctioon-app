import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/utils/notifications/registerForPushNotifications';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { router } from 'expo-router';
import { getNotificationRouteFromResponse } from '@/utils/notifications/getNotificationRoute';

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

  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined
  );

  useEffect(() => {
    // 🚀 Check if app was opened from a notification (when app was closed)
    const checkLastNotification = () => {
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
            // Small delay to ensure app is fully loaded
            setTimeout(() => {
              router.push(route as any);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('ERROR_GET_LAST_NOTIFICATION_RESPONSE', error);
        sentryErrorReport(
          error as Error,
          'GET_LAST_NOTIFICATION_RESPONSE_ERROR'
        );
      }
    };

    checkLastNotification();

    // Register for push notifications and get token
    registerForPushNotificationsAsync().then(
      (token) => {
        if (token) {
          setExpoPushToken(token);
          // TODO: Send token to backend to store in database
          // await securePost({
          //   endpoint: SECURE_ENDPOINTS.NOTIFICATIONS.REGISTER,
          //   data: { token }
          // });
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
            router.push(route as any);
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
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
