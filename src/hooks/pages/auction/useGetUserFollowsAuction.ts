import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const USER_FOLLOW_INFO_LOAD_ERROR =
  'errors.auction.userFollowInfoLoadFailed' as const satisfies MessageKey;

export const useGetUserFollowsAuction = ({
  auctionId,
}: {
  auctionId: string;
}): ActionResponse<boolean> => {
  const [follows, setFollows] = useState<boolean>(false);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const getUserFollows = useCallback(async () => {
    try {
      setStatus('loading');
      const res = await secureGet<boolean>({
        endpoint: `/auctions/${auctionId}/user-follows`,
      });

      if (res.error) {
        setStatus('error');
        setErrorMessage(res.error);
        setFollows(false);
        return {
          message: USER_FOLLOW_INFO_LOAD_ERROR,
        };
      }

      const follows = res.data;

      setStatus('success');
      setFollows(follows ?? false);

      return {
        error: null,
        success: null,
        follows,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMessage,
        'GET_USER_FOLLOWS_AUCTION - Unexpected error'
      );

      console.error('Unexpected error fetching auctions:', errorMessage);

      return {
        message: USER_FOLLOW_INFO_LOAD_ERROR,
      };
    }
  }, [auctionId, secureGet]);

  useEffect(() => {
    getUserFollows();
  }, [getUserFollows]);

  return {
    data: follows,
    status,
    errorMessage,
    setErrorMessage,
  };
};
