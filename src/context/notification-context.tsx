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
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          console.log('🔔 Notification Response:', response);

          // TODO: Navigate based on notification data
          // Example:
          // const data = response.notification.request.content.data;
          // if (data?.type === 'auction') {
          //   router.push(`/(tabs)/auctions/${data.auctionId}`);
          // } else if (data?.type === 'bid') {
          //   router.push(`/(tabs)/my-auctions/${data.auctionId}`);
          // } else if (data?.type === 'payment') {
          //   router.push(`/(tabs)/account/payment-history`);
          // }
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
