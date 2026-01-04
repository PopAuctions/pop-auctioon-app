import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  // ⚙️ Configure Android notification channel - Defines notification STYLE
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PopAuction Notifications', // 📱 Name visible in system settings
      description: 'Notificaciones de subastas y ofertas', // 📝 Channel description
      importance: Notifications.AndroidImportance.MAX, // 🔔 MAX = heads-up notification
      vibrationPattern: [0, 250, 250, 250], // 📳 Vibration pattern [delay, vibrate, pause, vibrate...]
      lightColor: '#FF231F7C', // 💡 LED color (if device has LED)
      sound: 'default', // 🔊 Sound: 'default' or null for silent
      enableVibrate: true, // 📳 Enable vibration
      showBadge: true, // 🔴 Show badge on app icon
      enableLights: true, // 💡 Enable LED notification
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // 🔒 Visibility on lock screen
    });
  }

  // 📱 Check if device is physical (not simulator/emulator)
  // NOTE: Push notifications DO NOT work on simulators/emulators
  if (!Device.isDevice) {
    return undefined;
  }

  // 🔐 Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    const error = new Error('Permission not granted to get push token');
    console.error('ERROR_PUSH_NOTIFICATION_PERMISSION', error);
    // sentryErrorReport(error, 'PUSH_NOTIFICATION_PERMISSION_DENIED');
    return undefined;
  }

  // 🔑 Get project ID from constants
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    const error = new Error('Project ID not found in app config');
    console.error('ERROR_PUSH_NOTIFICATION_PROJECT_ID', error);
    sentryErrorReport(error, 'PUSH_NOTIFICATION_NO_PROJECT_ID');
    return undefined;
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log('📱 Expo Push Token:', pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    const error = new Error(`Failed to get push token: ${e}`);
    console.error('ERROR_GET_PUSH_TOKEN', error);
    sentryErrorReport(error, 'PUSH_NOTIFICATION_GET_TOKEN_FAILED');
    return undefined;
  }
}
