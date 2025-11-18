import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  Auction,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface CustomAuction {
  id: string;
  Auction: Auction;
}

export const useGetFollowedAuctions = (): ActionResponse<
  CustomAuction[] | null
> => {
  const [auctions, setAuctions] = useState<CustomAuction[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchFollowedArticles = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<CustomAuction[]>({
      endpoint: SECURE_ENDPOINTS.AUCTIONS.FOLLOWED_AUCTIONS,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching followed auctions',
        es: 'Error al obtener las subastas seguidas',
      });
      return {
        message: {
          en: 'Error fetching followed auctions',
          es: 'Error al obtener las subastas seguidas',
        },
      };
    }

    setAuctions(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchFollowedArticles = useCallback(async () => {
    const res = await secureGet<CustomAuction[]>({
      endpoint: SECURE_ENDPOINTS.AUCTIONS.FOLLOWED_AUCTIONS,
    });

    if (res.error) {
      return {
        message: {
          en: 'Error fetching followed auctions',
          es: 'Error al obtener las subastas seguidas',
        },
      };
    }

    setAuctions(res.data || null);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  useEffect(() => {
    fetchFollowedArticles();
  }, [fetchFollowedArticles]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchFollowedArticles,
  };
};
