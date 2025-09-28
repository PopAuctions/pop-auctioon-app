import { AuctionStatus } from '@/constants/auctions';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import {
  ActionResponse,
  LiveAuction,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { supabase } from '@/utils/supabase/supabase-store';
import { useCallback, useEffect, useState } from 'react';

export const useGetLiveAuction = ({
  auctionId,
  validateIsLive = false,
}: {
  auctionId: string;
  validateIsLive?: boolean;
}): ActionResponse<LiveAuction | null> & {
  refetch: () => RefetchReturn;
} => {
  const [auction, setAuction] = useState<LiveAuction | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');

  const fetchLiveAuction = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('LiveAuction')
        .select(
          'id, auctionId, currentArticleBidId, articlesOrder, ArticleBid ( articleId, highestBidderUsername, highestBidderImage, available, countdownActive, countdownAmount ), Auction ( id, status, title, mode, image )'
        )
        .eq('auctionId', auctionId);

      if (error) {
        setStatus('error');
        const errorMessage = error?.message || 'Unknown error occurred';

        sentryErrorReport(errorMessage, '1_USE_GET_LIVE_AUCTION');

        return {
          message: {
            en: 'Error fetching auction',
            es: 'Error al obtener la subasta',
          },
        };
      }

      if (!data || data.length === 0) {
        setStatus('error');
        return {
          message: {
            en: 'Auction not found',
            es: 'Subasta no encontrada',
          },
        };
      }

      const liveAuction = data[0] as unknown as LiveAuction;
      const auction = liveAuction.Auction;
      const auctionStatus = auction.status as AuctionStatus;

      if (validateIsLive) {
        if (auctionStatus === AuctionStatus.FINISHED) {
          setStatus('error');
          return {
            message: {
              en: 'The auction has ended',
              es: 'La subasta ha finalizado',
            },
          };
        }

        if (auctionStatus === AuctionStatus.AVAILABLE) {
          setStatus('error');
          return {
            message: {
              en: 'The auction has not started yet',
              es: 'La subasta no ha comenzado aún',
            },
          };
        }
      }

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
  }, [auctionId, validateIsLive]);

  useEffect(() => {
    fetchLiveAuction();
  }, [fetchLiveAuction]);

  return {
    data: auction as LiveAuction | null,
    status,
    refetch: fetchLiveAuction,
  };
};
