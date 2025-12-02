import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  Auction,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetMyAuctions = (): ActionResponse<Auction[] | null> & {
  refetch: () => Promise<void>;
} => {
  const [auctions, setAuctions] = useState<Auction[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchAuctionsMade = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<Auction[]>({
      endpoint: SECURE_ENDPOINTS.MY_AUCTIONS.LIST,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching auctions',
        es: 'Error al obtener subastas',
      });
      return {
        message: {
          en: 'Error fetching auctions',
          es: 'Error al obtener subastas',
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

  const refetchAuctionsMade = useCallback(async () => {
    const res = await secureGet<Auction[]>({
      endpoint: SECURE_ENDPOINTS.MY_AUCTIONS.LIST,
    });

    if (res.error) {
      return;
    }

    setAuctions(res.data || null);

    return;
  }, [secureGet]);

  useEffect(() => {
    fetchAuctionsMade();
  }, [fetchAuctionsMade]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchAuctionsMade,
  };
};
