import { useState, useEffect, useCallback } from 'react';
import type {
  ActionResponse,
  CustomAuction,
  RequestStatus,
} from '@/types/types';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { REQUEST_STATUS } from '@/constants';
import type { MessageKey } from '@/i18n';

const UPCOMING_AUCTIONS_LOAD_ERROR =
  'errors.auction.upcomingAuctionsLoadFailed' as const satisfies MessageKey;

interface AuctionsData {
  today: CustomAuction[];
  this_month: CustomAuction[];
  next_month: CustomAuction[];
}

export const useAuctionsCalendar = (): ActionResponse<
  AuctionsData,
  MessageKey
> => {
  const [auctions, setAuctions] = useState<AuctionsData>({
    today: [],
    this_month: [],
    next_month: [],
  });
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchAuctions = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<AuctionsData>({
      endpoint: `/auctions/calendar`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(UPCOMING_AUCTIONS_LOAD_ERROR);
      return {
        message: UPCOMING_AUCTIONS_LOAD_ERROR,
      };
    }

    setAuctions(res.data as AuctionsData);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [protectedGet]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchAuctions,
  };
};
