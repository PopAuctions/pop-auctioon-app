import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  Countries,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useFetchAvailableCountries = (): ActionResponse<Countries> & {
  refetch: () => Promise<void>;
} => {
  const [countries, setCountries] = useState<Countries | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchCountries = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<Countries>({
        endpoint: SECURE_ENDPOINTS.GLOBALS.COUNTRIES,
      });

      if (response.error) {
        console.error('ERROR_LOAD_COUNTRIES', response.error);
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      setCountries(response.data as Countries);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_COUNTRIES - Unexpected error');

      console.error('ERROR_LOAD_COUNTRIES_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage({
        en: 'Error loading countries',
        es: 'Error al cargar los países',
      });
    }
  }, [secureGet]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    data: countries as Countries,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchCountries,
  };
};
