import { REQUEST_STATUS } from '@/constants';
import { AuctionStatus } from '@/constants/auctions';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import {
  ActionResponse,
  LangMap,
  LiveAuction,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface FetchLiveAuctionResponse {
  auction: LiveAuction | null;
  status: AuctionStatus | null;
}

export const useGetLiveAuction = ({
  auctionId,
  validateIsLive = false,
}: {
  auctionId: string;
  validateIsLive?: boolean;
}): ActionResponse<FetchLiveAuctionResponse | null> & {
  refetch: () => Promise<void>;
} => {
  const [auction, setAuction] = useState<FetchLiveAuctionResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
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
        setErrorMessage(res.error);
        return {
          message: res.error,
        };
      }

      if (!res.data) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage({
          en: 'Auction not found',
          es: 'Subasta no encontrada',
        });
        return {
          message: {
            en: 'Auction not found',
            es: 'Subasta no encontrada',
          },
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
        message: {
          en: 'Error fetching auction',
          es: 'Error al obtener la subasta',
        },
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
        setErrorMessage(res.error);
        return;
      }

      if (!liveAuction) {
        setErrorMessage({
          en: 'Auction not found',
          es: 'Subasta no encontrada',
        });
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
