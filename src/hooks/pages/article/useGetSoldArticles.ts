import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  CustomPaidArticle,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ARTICLES_LOAD_ERROR =
  'errors.article.articlesLoadFailed' as const satisfies MessageKey;

export const useGetSoldArticles = ({
  auctionId,
  status,
}: { auctionId?: string; status?: string } = {}): ActionResponse<
  CustomPaidArticle[],
  MessageKey
> => {
  const [soldArticle, setSoldArticle] = useState<CustomPaidArticle[]>([]);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    REQUEST_STATUS.idle
  );
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchSoldArticles = useCallback(async () => {
    setRequestStatus(REQUEST_STATUS.loading);

    const queryParams = new URLSearchParams();
    if (auctionId) queryParams.append('auctionId', auctionId);
    if (status) queryParams.append('status', status);

    const res = await secureGet<CustomPaidArticle[]>({
      endpoint: `${SECURE_ENDPOINTS.USER.SOLD_ARTICLES}?${queryParams.toString()}`,
    });

    if (res.error) {
      setRequestStatus(REQUEST_STATUS.error);
      setErrorMessage(ARTICLES_LOAD_ERROR);
      setSoldArticle([]);
      return {
        message: ARTICLES_LOAD_ERROR,
      };
    }

    setSoldArticle(res.data ?? []);
    setRequestStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, auctionId, status]);

  useEffect(() => {
    fetchSoldArticles();
  }, [fetchSoldArticles]);

  return {
    data: soldArticle,
    status: requestStatus,
    errorMessage,
    setErrorMessage,
  };
};
