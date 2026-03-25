import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  DisplayedNotification,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetUnreadUserNotifications = (): ActionResponse<
  DisplayedNotification[]
> => {
  const [notifications, setNotifications] = useState<DisplayedNotification[]>(
    []
  );
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchUnreadUserNotifications = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<DisplayedNotification[]>({
      endpoint: SECURE_ENDPOINTS.USER.NOTIFICATIONS.UNREAD,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching notifications',
        es: 'Error al obtener las notificaciones',
      });
      setNotifications([]);
      return {
        message: {
          en: 'Error fetching notifications',
          es: 'Error al obtener las notificaciones',
        },
      };
    }

    const notifications = res.data;
    if (!notifications) {
      setStatus(REQUEST_STATUS.error);
      setNotifications([]);
      return {
        message: {
          en: 'No notifications',
          es: 'No hay notificaciones',
        },
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
