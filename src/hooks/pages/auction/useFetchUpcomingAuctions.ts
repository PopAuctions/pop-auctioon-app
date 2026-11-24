import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Auction, RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';

const UPCOMING_AUCTIONS_LOAD_ERROR =
  'errors.auction.upcomingAuctionsLoadFailed' as const satisfies MessageKey;

export const useFetchUpcomingAuctions = (): ActionResponse<
  Auction[],
  MessageKey
> => {
  const [auctions, setUpcomingAuctions] = useState<Auction[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchUpcomingAuctions = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<Auction[]>({
      endpoint: `/auctions/upcoming`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(UPCOMING_AUCTIONS_LOAD_ERROR);
      return {
        message: UPCOMING_AUCTIONS_LOAD_ERROR,
      };
    }

    setUpcomingAuctions(res.data || []);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [protectedGet]);

  useEffect(() => {
    fetchUpcomingAuctions();
  }, [fetchUpcomingAuctions]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
  };
};
