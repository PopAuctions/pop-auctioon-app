import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import {
  ActionResponse,
  LangMap,
  LiveAuction,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetLiveAuction = ({
  auctionId,
  validateIsLive = false,
}: {
  auctionId: string;
  validateIsLive?: boolean;
}): ActionResponse<LiveAuction | null> & {
  refetch: () => Promise<void>;
} => {
  const [auction, setAuction] = useState<LiveAuction | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchLiveAuction = useCallback(async () => {
    try {
      setStatus('loading');
      const params = new URLSearchParams();
      params.append('validateIsLive', String(validateIsLive));

      const res = await protectedGet<LiveAuction>({
        endpoint: `/auctions/${auctionId}?${params}`,
      });

      if (res.error) {
        console.log('error', res.error);
        setStatus('error');
        setErrorMessage(res.error);
        return {
          message: {
            en: 'Error fetching auction',
            es: 'Error al obtener la subasta',
          },
        };
      }

      if (!res.data) {
        setStatus('error');
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

      setStatus('success');
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
        '2_USE_GET_LIVE_AUCTION - Unexpected error'
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

      const res = await protectedGet<LiveAuction>({
        endpoint: `/auctions/${auctionId}?${params}`,
      });

      if (res.error) {
        console.log('error', res.error);
        setStatus('error');
        setErrorMessage(res.error);
        return;
      }

      if (!res.data) {
        setErrorMessage({
          en: 'Auction not found',
          es: 'Subasta no encontrada',
        });
        return;
      }

      const liveAuction = res.data;

      setStatus('success');
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
    data: auction as LiveAuction | null,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchLiveAuction,
  };
};
