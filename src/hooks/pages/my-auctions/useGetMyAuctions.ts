import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { ActionResponse, Auction, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const MY_AUCTIONS_LOAD_ERROR =
  'errors.auction.myListLoadFailed' as const satisfies MessageKey;

export const useGetMyAuctions = ({
  getFinished = false,
}: { getFinished?: boolean } = {}): ActionResponse<
  Auction[] | null,
  MessageKey
> & {
  refetch: () => Promise<void>;
} => {
  const [auctions, setAuctions] = useState<Auction[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchAuctionsMade = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<Auction[]>({
      endpoint: `${SECURE_ENDPOINTS.MY_AUCTIONS.LIST}?finished=${getFinished}`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(res.messageCode ?? MY_AUCTIONS_LOAD_ERROR);
      return {
        message: res.messageCode ?? MY_AUCTIONS_LOAD_ERROR,
      };
    }

    setAuctions(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, getFinished]);

  const refetchAuctionsMade = useCallback(async () => {
    const res = await secureGet<Auction[]>({
      endpoint: `${SECURE_ENDPOINTS.MY_AUCTIONS.LIST}?finished=${getFinished}`,
    });

    if (res.error) {
      return;
    }

    setAuctions(res.data || null);

    return;
  }, [secureGet, getFinished]);

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
