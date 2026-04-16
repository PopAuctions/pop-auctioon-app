import { ActionResponse, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { REQUEST_STATUS } from '@/constants';
import { AuctionStatus } from '@/constants/auctions';

type NowAndNextAuctionDTO =
  | { auctionId: number; status: AuctionStatus.LIVE }
  | { auctionId: number; status: AuctionStatus.AVAILABLE }
  | { auctionId: null; status: null };

export const useFetchNowNextAuction = ({
  firstFetchResponse,
}: {
  firstFetchResponse: React.RefObject<boolean>;
}): Omit<
  ActionResponse<NowAndNextAuctionDTO | null>,
  'errorMessage' | 'setErrorMessage'
> => {
  const [data, setData] = useState<NowAndNextAuctionDTO | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const { protectedGet } = useSecureApi();

  const fetchNowNextAuction = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);

      const response = await protectedGet<NowAndNextAuctionDTO>({
        endpoint: SECURE_ENDPOINTS.AUCTIONS.NOW_NEXT,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus(REQUEST_STATUS.error);
        return;
      }
      setTimeout(() => {
        if (firstFetchResponse.current) {
          firstFetchResponse.current = false;
        }
      }, 0);

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_NOW_NEXT_AUCTION - Unexpected error'
      );

      setStatus(REQUEST_STATUS.error);
    }
  }, [protectedGet, firstFetchResponse]);

  useEffect(() => {
    fetchNowNextAuction();
  }, [fetchNowNextAuction]);

  return {
    data,
    status,
    refetch: fetchNowNextAuction,
  };
};
