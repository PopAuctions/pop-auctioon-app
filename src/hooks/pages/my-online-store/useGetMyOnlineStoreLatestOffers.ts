import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  ArticleSecondChanceWithOffers,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const OFFERS_LOAD_ERROR =
  'errors.offer.latestAppLoadFailed' as const satisfies MessageKey;
const OFFERS_REFRESH_ERROR =
  'errors.offer.latestRefreshFailed' as const satisfies MessageKey;
const OFFERS_UPDATED =
  'offer.listUpdatedSuccessfully' as const satisfies MessageKey;

export const useGetMyOnlineStoreLatestOffers = (): Omit<
  ActionResponse<ArticleSecondChanceWithOffers[], MessageKey>,
  'refetch'
> & {
  refetch: () => RefetchReturn<MessageKey>;
} => {
  const [article, setArticle] = useState<ArticleSecondChanceWithOffers[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<ArticleSecondChanceWithOffers[]>({
      endpoint: '/my-online-store/offers',
    });

    if (res.error) {
      console.log(res.error);
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(OFFERS_LOAD_ERROR);
      return {
        message: OFFERS_LOAD_ERROR,
      };
    }

    if (!res.data) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(OFFERS_LOAD_ERROR);
      return {
        message: OFFERS_LOAD_ERROR,
      };
    }

    setArticle(res.data);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetch = async () => {
    const res = await secureGet<ArticleSecondChanceWithOffers[]>({
      endpoint: '/my-online-store/offers',
    });

    if (res.error || !res.data) {
      return {
        message: OFFERS_REFRESH_ERROR,
      };
    }

    setArticle(res.data);

    return {
      message: OFFERS_UPDATED,
    };
  };

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
    refetch,
  };
};
