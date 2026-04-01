import { REQUEST_STATUS } from '@/constants';
import { AuctionStatus } from '@/constants/auctions';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { ActionResponse, LangMap, Auction, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface FetchLiveAuctionResponse {
  auction: Auction | null;
  status: AuctionStatus | null;
}

export const useGetMyAuction = ({
  auctionId,
}: {
  auctionId: string;
}): ActionResponse<FetchLiveAuctionResponse | null> & {
  refetch: () => Promise<void>;
} => {
  const [auction, setAuction] = useState<FetchLiveAuctionResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchMyAuction = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);

      const res = await secureGet<FetchLiveAuctionResponse>({
        endpoint: `/my-auctions/${auctionId}`,
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
        '1_USE_GET_MY_AUCTION - Unexpected error'
      );

      console.error('Unexpected error fetching auctions:', errorMessage);

      return {
        message: {
          en: 'Error fetching auction',
          es: 'Error al obtener la subasta',
        },
      };
    }
  }, [auctionId, secureGet]);

  const refetchMyAuction = useCallback(async () => {
    try {
      const res = await secureGet<FetchLiveAuctionResponse>({
        endpoint: `/my-auctions/${auctionId}`,
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
        '2_USE_GET_MY_AUCTION - Unexpected error'
      );
    }
  }, [auctionId, secureGet]);

  useEffect(() => {
    fetchMyAuction();
  }, [fetchMyAuction]);

  return {
    data: auction,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchMyAuction,
  };
};
