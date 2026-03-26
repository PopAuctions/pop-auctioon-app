import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useGetUserNotifications } from '@/hooks/pages/notifications/useGetUserNotifications';
import { FlatList } from 'react-native-gesture-handler';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { DisplayedNotification, NotificationEventType } from '@/types/types';
import { getNotificationRedirectUrl } from '@/utils/getNotificationRedirectUrl';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';

export default function UserNotificationsScreen() {
  const { t, locale } = useTranslation();
  const {
    data: notificationsData,
    status,
    errorMessage,
    refetch: refetchNotifications,
  } = useGetUserNotifications();
  const { navigateWithAuth } = useAuthNavigation();
  const { securePatch } = useSecureApi();
  const { callToast } = useToast(locale);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const unreadCount = useMemo(() => {
    const unread = notificationsData.filter(
      (notification) => !notification.read
    );

    return unread.length;
  }, [notificationsData]);

  useFocusEffect(
    useCallback(() => {
      refetchNotifications?.();
    }, [refetchNotifications])
  );

  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/notifications'
      />
    );
  }

  const handleReadAllNotifications = async () => {
    if (unreadCount === 0) {
      callToast({
        variant: 'info',
        description: {
          es: 'No hay notificaciones sin leer',
          en: 'There are no unread notifications',
        },
      });

      return;
    }

    setMarkingAsRead(true);

    const response = await securePatch({
      endpoint: SECURE_ENDPOINTS.USER.NOTIFICATIONS.MARK_ALL_AS_READ,
    });

    if (!response) {
      callToast({
        variant: 'error',
        description: {
          es: 'Hubo un error marcando como leídas las notificaciones',
          en: 'There was an error marking notifications as read',
        },
      });
      setMarkingAsRead(false);
      return;
    }

    setMarkingAsRead(false);
    refetchNotifications?.();
  };

  const handleReadNotification = async (
    notification: DisplayedNotification
  ) => {
    await securePatch({
      endpoint: SECURE_ENDPOINTS.USER.NOTIFICATIONS.READ(notification.id),
    });
    const url = getNotificationRedirectUrl({
      event: notification.event as NotificationEventType,
      metadata: notification.metadata,
    });

    const separator = url.includes('?') ? '&' : '?';
    navigateWithAuth(`${url}${separator}fromTab=true`);
  };

  const header = () => {
    return (
      <View className='mb-2 flex flex-row justify-end'>
        <Button
          mode='empty'
          onPress={handleReadAllNotifications}
          className='mb-2 text-center text-text-black'
          textClassName='underline'
          disabled={markingAsRead || unreadCount === 0}
          isLoading={markingAsRead}
        >
          {t('screens.notifications.markAllAsRead')}
        </Button>
      </View>
    );
  };

  return (
    <View className='flex-1 bg-white px-4 pt-4'>
      {notificationsData.length === 0 ? (
        <View className='flex-1 items-center justify-center px-6'>
          <View className='border-gray-200 bg-gray-50 rounded-3xl border px-6 py-8'>
            <CustomText
              type='h4'
              className='mb-2 text-center text-text-black'
            >
              {t('screens.notifications.noNotifications')}
            </CustomText>
          </View>
        </View>
      ) : (
        <FlatList
          data={notificationsData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              lang={locale}
              locale={locale}
              onPress={handleReadNotification}
            />
          )}
          ListHeaderComponent={header}
        />
      )}
    </View>
  );
}
