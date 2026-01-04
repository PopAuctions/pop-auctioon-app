import * as Notifications from 'expo-notifications';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

/**
 * 🧭 Extract route from notification data
 *
 * This utility extracts the navigation route from a notification payload.
 * The route should be sent from the backend in the `data.route` field.
 *
 * @param notification - Notification object from expo-notifications
 * @returns Route string to navigate to, or null if no valid route found
 *
 * @example
 * // Backend sends:
 * {
 *   to: 'ExponentPushToken[...]',
 *   title: 'New auction',
 *   body: 'Rare item available',
 *   data: {
 *     route: '/(tabs)/auctions/32',  // ← Route to navigate to
 *   }
 * }
 *
 * // Usage in app:
 * const route = getNotificationRoute(notification);
 * if (route) {
 *   router.push(route);
 * }
 */
export function getNotificationRoute(
  notification: Notifications.Notification | null
): string | null {
  try {
    if (!notification) {
      return null;
    }

    const data = notification.request.content.data;

    // Check if route exists in data
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Extract route (support both 'route' and 'path' keys for flexibility)
    const route = (data.route as string) || (data.path as string);

    if (!route || typeof route !== 'string') {
      return null;
    }

    // Validate route format (should start with / or be a valid Expo Router path)
    if (!route.startsWith('/') && !route.startsWith('(')) {
      return null;
    }

    return route;
  } catch (error) {
    sentryErrorReport(error as Error, 'GET_NOTIFICATION_ROUTE_ERROR');
    return null;
  }
}

/**
 * 🧭 Extract route from notification response
 *
 * This is a convenience wrapper for responses (when user taps notification).
 *
 * @param response - NotificationResponse object from expo-notifications
 * @returns Route string to navigate to, or null if no valid route found
 */
export function getNotificationRouteFromResponse(
  response: Notifications.NotificationResponse | null
): string | null {
  if (!response) {
    return null;
  }

  return getNotificationRoute(response.notification);
}
