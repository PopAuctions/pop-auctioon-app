import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetMyStoreCommission = (): ActionResponse<number> => {
  const [commission, setCommission] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchStoreCommission = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<number>({
      endpoint: SECURE_ENDPOINTS.STORE.COMMISSION,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(
        res?.error ?? {
          en: 'Error fetching commission',
          es: 'Error al obtener la comisión',
        }
      );
      return {
        message: {
          en: 'Error fetching commission',
          es: 'Error al obtener la comisión',
        },
      };
    }

    if (res.data === null || res.data === undefined) {
      setStatus('error');
      setErrorMessage({
        en: 'Commission data is missing',
        es: 'Faltan los datos de comisión',
      });
      return;
    }

    setCommission(res.data);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchAuctionsMade = useCallback(async () => {
    const res = await secureGet<number>({
      endpoint: SECURE_ENDPOINTS.STORE.COMMISSION,
    });

    if (res.error || !res.data) {
      return;
    }

    setCommission(res.data);

    return;
  }, [secureGet]);

  useEffect(() => {
    fetchStoreCommission();
  }, [fetchStoreCommission]);

  return {
    data: commission,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchAuctionsMade,
  };
};
