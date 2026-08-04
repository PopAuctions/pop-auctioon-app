import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { StorePayoutWithItems } from '@/types/payouts';
import type { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetStorePayoutById = ({
  payoutId,
}: {
  payoutId: string;
}): ActionResponse<StorePayoutWithItems | null> => {
  const [auctions, setAuctions] = useState<StorePayoutWithItems | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchStorePayoutsDachboard = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<StorePayoutWithItems>({
      endpoint: `${SECURE_ENDPOINTS.STORE.PAYOUTS.SINGLE(payoutId)}`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(
        res?.error ?? {
          en: 'Error fetching auctions',
          es: 'Error al obtener subastas',
        }
      );
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
  }, [secureGet, payoutId]);

  const refetchAuctionsMade = useCallback(async () => {
    const res = await secureGet<StorePayoutWithItems>({
      endpoint: `${SECURE_ENDPOINTS.STORE.PAYOUTS.SINGLE(payoutId)}`,
    });

    if (res.error) {
      return;
    }

    setAuctions(res.data || null);

    return;
  }, [secureGet, payoutId]);

  useEffect(() => {
    fetchStorePayoutsDachboard();
  }, [fetchStorePayoutsDachboard]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchAuctionsMade,
  };
};
