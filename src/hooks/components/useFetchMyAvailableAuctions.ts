import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

interface Auction {
  label: string;
  value: string;
}

export const useFetchMyAvailableAuctions = (
  shouldFetch = true
): ActionResponse<Auction[]> => {
  const [data, setData] = useState<Auction[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchMyAvailableAuctions = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<Auction[]>({
        endpoint: SECURE_ENDPOINTS.MY_AUCTIONS.AVAILABLE,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus('error');
        setErrorMessage({
          en: 'Available auctions data is missing',
          es: 'Faltan los datos de subastas disponibles',
        });
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_MY_AVAILABLE_AUCTIONS - Unexpected error'
      );

      const message: LangMap = {
        en: 'Error fetching available auctions data',
        es: 'Error al cargar las subastas disponibles',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [secureGet]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchMyAvailableAuctions();
  }, [fetchMyAvailableAuctions, shouldFetch]);

  return {
    data,
    status,
    refetch: fetchMyAvailableAuctions,
    errorMessage,
    setErrorMessage,
  };
};
