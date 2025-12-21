import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Este hook solo trae el valor de comisión (número)
// Para payment checkout completo con impuestos, shipping, etc, usar useFetchPaymentConfig
export const useFetchCommissions = (): ActionResponse<number> => {
  const [data, setData] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchCommission = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await protectedGet<number>({
        endpoint: PROTECTED_ENDPOINTS.PAYMENT.COMMISSIONS,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus('error');
        setErrorMessage({
          en: 'Commission data is missing',
          es: 'Faltan los datos de comisión',
        });
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_COMMISSION - Unexpected error');

      const message: LangMap = {
        en: 'Error fetching commission data',
        es: 'Error al cargar la comisión',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [protectedGet]);

  useEffect(() => {
    fetchCommission();
  }, [fetchCommission]);

  return {
    data,
    status,
    refetch: fetchCommission,
    errorMessage,
    setErrorMessage,
  };
};
