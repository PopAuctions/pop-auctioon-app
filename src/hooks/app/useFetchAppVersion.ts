import { useState, useCallback, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { REQUEST_STATUS } from '@/constants';

export const useFetchAppVersion = (): ActionResponse<number> => {
  const [data, setData] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchAppVersion = useCallback(async (): Promise<void> => {
    setErrorMessage(null);

    try {
      const response = await protectedGet<number>({
        endpoint: SECURE_ENDPOINTS.CONFIG.APP_VERSION,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error || 'There was an error getting data');
        return;
      }

      if (!response.data) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage({
          es: 'Hubo un error obteniendo información',
          en: 'There was an error getting data',
        });
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch {
      const errorMsg: LangMap = {
        es: 'Error al cargar información',
        en: 'Error loading information',
      };
      setErrorMessage(errorMsg);
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
