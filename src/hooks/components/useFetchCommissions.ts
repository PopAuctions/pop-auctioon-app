import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

export const useFetchCommissions = (): ActionResponse<number> => {
  const [data, setData] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticles = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await protectedGet<number>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.COMMISSIONS,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      setData(response.data ?? -1);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_COMMISSIONS - Unexpected error');

      const message: LangMap = {
        en: 'Error loading auction articles',
        es: 'Error al cargar los artículos de la subasta',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [protectedGet]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);
  return {
    data,
    status,
    errorMessage,
    setErrorMessage,
  };
};
