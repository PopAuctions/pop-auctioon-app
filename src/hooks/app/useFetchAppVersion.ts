import { useState, useCallback, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, RequestStatus } from '@/types/types';
import { REQUEST_STATUS } from '@/constants';
import type { MessageKey } from '@/i18n';

const APP_VERSION_DATA_MISSING_ERROR =
  'errors.config.appVersionMissing' as const satisfies MessageKey;
const APP_VERSION_LOAD_ERROR =
  'errors.config.appVersionLoadFailed' as const satisfies MessageKey;

export const useFetchAppVersion = (): ActionResponse<number, MessageKey> => {
  const [data, setData] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchAppVersion = useCallback(async (): Promise<void> => {
    setErrorMessage(null);

    try {
      const response = await protectedGet<number>({
        endpoint: SECURE_ENDPOINTS.CONFIG.APP_VERSION,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.messageCode ?? APP_VERSION_DATA_MISSING_ERROR);
        return;
      }

      if (!response.data) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(APP_VERSION_DATA_MISSING_ERROR);
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch {
      setErrorMessage(APP_VERSION_LOAD_ERROR);
      setStatus(REQUEST_STATUS.error);
    }
  }, [protectedGet]);

  useEffect(() => {
    fetchAppVersion();
  }, [fetchAppVersion]);

  return {
    data: data,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchAppVersion,
  };
};
