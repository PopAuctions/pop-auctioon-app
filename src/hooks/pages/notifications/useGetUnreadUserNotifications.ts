import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  DisplayedNotification,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { normalizeNotificationsData } from '@/utils/notifications/normalize-notifications-data';
import type { MessageKey } from '@/i18n';

const NOTIFICATIONS_LOAD_ERROR =
  'errors.notification.loadFailed' as const satisfies MessageKey;
const NO_NOTIFICATIONS_MESSAGE =
  'errors.notification.none' as const satisfies MessageKey;

export const useGetUnreadUserNotifications = (): ActionResponse<
  DisplayedNotification[],
  MessageKey
> => {
  const [notifications, setNotifications] = useState<DisplayedNotification[]>(
    []
  );
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchUnreadUserNotifications = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<DisplayedNotification[]>({
      endpoint: SECURE_ENDPOINTS.USER.NOTIFICATIONS.UNREAD,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(NOTIFICATIONS_LOAD_ERROR);
      setNotifications([]);
      return {
        message: NOTIFICATIONS_LOAD_ERROR,
      };
    }

    const notifications = normalizeNotificationsData(res.data);
    if (!notifications) {
      setStatus(REQUEST_STATUS.error);
      setNotifications([]);
      return {
        message: NO_NOTIFICATIONS_MESSAGE,
      };
    }

    setNotifications(notifications);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  useEffect(() => {
    fetchUnreadUserNotifications();
  }, [fetchUnreadUserNotifications]);

  return {
    data: notifications,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchUnreadUserNotifications,
  };
};
