import { REQUEST_STATUS } from '@/constants';
import { AuctionStatus } from '@/constants/auctions';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { ActionResponse, LiveAuction, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

interface FetchLiveAuctionResponse {
  auction: LiveAuction | null;
  status: AuctionStatus | null;
}

const LIVE_AUCTION_NOT_FOUND_ERROR =
  'errors.auction.liveNotFound' as const satisfies MessageKey;

export const useGetLiveAuction = ({
  auctionId,
  validateIsLive = false,
}: {
  auctionId: string;
  validateIsLive?: boolean;
}): ActionResponse<FetchLiveAuctionResponse | null, MessageKey> & {
  refetch: () => Promise<void>;
} => {
  const [auction, setAuction] = useState<FetchLiveAuctionResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchLiveAuction = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);
      const params = new URLSearchParams();
      params.append('validateIsLive', String(validateIsLive));

      const res = await protectedGet<FetchLiveAuctionResponse>({
        endpoint: `/auctions/${auctionId}?${params}`,
      });

      if (res.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(res.messageCode ?? LIVE_AUCTION_NOT_FOUND_ERROR);
        return {
          message: res.messageCode ?? LIVE_AUCTION_NOT_FOUND_ERROR,
        };
      }

      if (!res.data) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(LIVE_AUCTION_NOT_FOUND_ERROR);
        return {
          message: LIVE_AUCTION_NOT_FOUND_ERROR,
        };
      }
      const liveAuction = res.data;

      setStatus(REQUEST_STATUS.success);
      setAuction(liveAuction);

      return {
        error: null,
        success: null,
        liveAuction,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMessage,
        '1_USE_GET_LIVE_AUCTION - Unexpected error'
      );

      console.error('Unexpected error fetching auctions:', errorMessage);

      return {
        message: LIVE_AUCTION_NOT_FOUND_ERROR,
      };
    }
  }, [auctionId, validateIsLive, protectedGet]);

  const refetchLiveAuction = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('validateIsLive', String(validateIsLive));

      const res = await protectedGet<FetchLiveAuctionResponse>({
        endpoint: `/auctions/${auctionId}?${params}`,
      });
      const liveAuction = res.data;

      if (res.error) {
        setAuction(liveAuction ?? null);
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(res.messageCode ?? LIVE_AUCTION_NOT_FOUND_ERROR);
        return;
      }

      if (!liveAuction) {
        setErrorMessage(LIVE_AUCTION_NOT_FOUND_ERROR);
        return;
      }

      setStatus(REQUEST_STATUS.success);
      setAuction(liveAuction);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMessage,
        '2_USE_GET_LIVE_AUCTION - Unexpected error'
      );
    }
  }, [auctionId, validateIsLive, protectedGet]);

  useEffect(() => {
    fetchLiveAuction();
  }, [fetchLiveAuction]);

  return {
    data: auction,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchLiveAuction,
  };
};
