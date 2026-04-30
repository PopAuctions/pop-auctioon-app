import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { REQUEST_STATUS } from '@/constants';

export const useFetchAutoBidsAmount = (
  articleId: string
): ActionResponse<number> => {
  const [data, setData] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.loading);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchAutoBidsAmount = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);

      const response = await protectedGet<number>({
        endpoint: SECURE_ENDPOINTS.AUTO_BID.GET(articleId),
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage({
          en: 'Auto-bid data is missing',
          es: 'Faltan los datos de puja automática',
        });
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_AUTO_BIDS - Unexpected error');

      const message: LangMap = {
        en: 'Error fetching auto-bid data',
        es: 'Error al cargar los datos de puja automática',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [protectedGet, articleId]);

  useEffect(() => {
    fetchAutoBidsAmount();
  }, [fetchAutoBidsAmount]);

  return {
    data,
    status,
    refetch: fetchAutoBidsAmount,
    errorMessage,
    setErrorMessage,
  };
};
