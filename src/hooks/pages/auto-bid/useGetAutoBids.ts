import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  LangMap,
  AutoBidArticle,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetAutoBids = (): ActionResponse<AutoBidArticle[] | null> & {
  refetch: () => Promise<void>;
} => {
  const [autoBids, setAutoBids] = useState<AutoBidArticle[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchOffersMade = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<AutoBidArticle[]>({
      endpoint: SECURE_ENDPOINTS.AUTO_BID.GET_ALL,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching autoBids made',
        es: 'Error al obtener las ofertas realizadas',
      });
      return {
        message: {
          en: 'Error fetching autoBids made',
          es: 'Error al obtener las ofertas realizadas',
        },
      };
    }

    setAutoBids(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchOffersMade = useCallback(async () => {
    const res = await secureGet<AutoBidArticle[]>({
      endpoint: SECURE_ENDPOINTS.AUTO_BID.GET_ALL,
    });

    if (res.error) {
      return;
    }

    setAutoBids(res.data || null);

    return;
  }, [secureGet]);

  useEffect(() => {
    fetchOffersMade();
  }, [fetchOffersMade]);

  return {
    data: autoBids,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchOffersMade,
  };
};
