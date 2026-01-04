import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync } from '@/utils/notifications/registerForPushNotifications';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('expo-constants');
jest.mock('@/lib/error/sentry-error-report');

describe('registerForPushNotifications', () => {
  const mockProjectId = 'test-project-id';
  const mockPushToken = 'ExponentPushToken[test-token]';

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (Device.isDevice as any) = true;
    (Platform.OS as any) = 'ios';

    // Mock Constants
    (Constants as any).expoConfig = {
      extra: {
        eas: {
          projectId: mockProjectId,
        },
      },
    };

    // Mock successful permission and token flow
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: mockPushToken,
    });
  });

  describe('Android Configuration', () => {
    beforeEach(() => {
      (Platform.OS as any) = 'android';
    });

    it('should configure Android notification channel with correct settings', async () => {
      await registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'default',
        expect.objectContaining({
          name: 'PopAuction Notifications',
          description: 'Notificaciones de subastas y ofertas',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
          showBadge: true,
          enableLights: true,
          sound: 'default',
          lightColor: '#FF231F7C',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        })
      );
    });

    it('should not configure notification channel on iOS', async () => {
      (Platform.OS as any) = 'ios';
      (Notifications.setNotificationChannelAsync as jest.Mock).mockClear();

      await registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });
  });

  describe('Device Check', () => {
    it('should return undefined if running on simulator/emulator', async () => {
      (Device.isDevice as any) = false;

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeUndefined();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should proceed with registration if running on physical device', async () => {
      (Device.isDevice as any) = true;

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(mockPushToken);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('Permission Handling', () => {
    it('should use existing permissions if already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      await registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permissions if not already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      await registerForPushNotificationsAsync();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return undefined and report error if permission denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeUndefined();
      expect(sentryErrorReport).toHaveBeenCalledWith(
        expect.any(Error),
        'PUSH_NOTIFICATION_PERMISSION_DENIED'
      );
    });
  });

  describe('Project ID Handling', () => {
    it('should get project ID from expoConfig.extra.eas', async () => {
      (Constants as any).expoConfig = {
        extra: {
          eas: {
            projectId: mockProjectId,
          },
        },
      };

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(mockPushToken);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: mockProjectId,
      });
    });

    it('should fallback to easConfig.projectId if expoConfig not available', async () => {
      (Constants as any).expoConfig = null;
      (Constants as any).easConfig = {
        projectId: 'fallback-project-id',
      };

      await registerForPushNotificationsAsync();

      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'fallback-project-id',
      });
    });

    it('should return undefined and report error if project ID not found', async () => {
      (Constants as any).expoConfig = null;
      (Constants as any).easConfig = null;

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeUndefined();
      expect(sentryErrorReport).toHaveBeenCalledWith(
        expect.any(Error),
        'PUSH_NOTIFICATION_NO_PROJECT_ID'
      );
    });
  });

  describe('Token Retrieval', () => {
    it('should successfully get and return push token', async () => {
      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(mockPushToken);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: mockProjectId,
      });
    });

    it('should handle token retrieval error and report to Sentry', async () => {
      const mockError = new Error('Token retrieval failed');
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
        mockError
      );

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeUndefined();
      expect(sentryErrorReport).toHaveBeenCalledWith(
        expect.any(Error),
        'PUSH_NOTIFICATION_GET_TOKEN_FAILED'
      );
    });

    it('should return token data string from response', async () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[new-token-123]',
      });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('ExponentPushToken[new-token-123]');
    });
  });

  describe('Integration Flow', () => {
    it('should complete full registration flow successfully', async () => {
      (Platform.OS as any) = 'android';
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: mockPushToken,
      });

      const result = await registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalled();
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(result).toBe(mockPushToken);
      expect(sentryErrorReport).not.toHaveBeenCalled();
    });

    it('should handle multiple error scenarios gracefully', async () => {
      jest.clearAllMocks();

      // Test 1: Simulator
      (Device.isDevice as any) = false;
      let result = await registerForPushNotificationsAsync();
      expect(result).toBeUndefined();

      // Test 2: Permission denied
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      result = await registerForPushNotificationsAsync();
      expect(result).toBeUndefined();

      // Test 3: No project ID
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Constants as any).expoConfig = null;
      (Constants as any).easConfig = null;
      result = await registerForPushNotificationsAsync();
      expect(result).toBeUndefined();

      expect(sentryErrorReport).toHaveBeenCalledTimes(2); // Permission + Project ID errors
    });
  });
});
