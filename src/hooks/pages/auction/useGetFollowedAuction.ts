import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { ActionResponse, Auction, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

interface CustomAuction {
  id: string;
  Auction: Auction;
}

const FOLLOWED_AUCTIONS_LOAD_ERROR =
  'errors.auction.followedAuctionsLoadFailed' as const satisfies MessageKey;

export const useGetFollowedAuctions = (): ActionResponse<
  CustomAuction[] | null,
  MessageKey
> => {
  const [auctions, setAuctions] = useState<CustomAuction[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchFollowedAuctions = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<CustomAuction[]>({
      endpoint: SECURE_ENDPOINTS.AUCTIONS.FOLLOWED_AUCTIONS,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(FOLLOWED_AUCTIONS_LOAD_ERROR);
      return {
        message: FOLLOWED_AUCTIONS_LOAD_ERROR,
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

  const refetchFollowedAuctions = useCallback(async () => {
    const res = await secureGet<CustomAuction[]>({
      endpoint: SECURE_ENDPOINTS.AUCTIONS.FOLLOWED_AUCTIONS,
    });

    if (res.error) {
      return {
        message: FOLLOWED_AUCTIONS_LOAD_ERROR,
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
    fetchFollowedAuctions();
  }, [fetchFollowedAuctions]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchFollowedAuctions,
  };
};
