import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  LangMap,
  MyOffers,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetOffersMade = (): ActionResponse<MyOffers[] | null> & {
  refetch: () => Promise<void>;
} => {
  const [offers, setOffers] = useState<MyOffers[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchOffersMade = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<MyOffers[]>({
      endpoint: SECURE_ENDPOINTS.OFFERS.MADE,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching offers made',
        es: 'Error al obtener las ofertas realizadas',
      });
      return {
        message: {
          en: 'Error fetching offers made',
          es: 'Error al obtener las ofertas realizadas',
        },
      };
    }

    setOffers(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchOffersMade = useCallback(async () => {
    const res = await secureGet<MyOffers[]>({
      endpoint: SECURE_ENDPOINTS.OFFERS.MADE,
    });

    if (res.error) {
      return;
    }

    setOffers(res.data || null);

    return;
  }, [secureGet]);

  useEffect(() => {
    fetchOffersMade();
  }, [fetchOffersMade]);

  return {
    data: offers,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchOffersMade,
  };
};
