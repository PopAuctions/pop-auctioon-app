import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ARTICLES_LOAD_ERROR =
  'errors.article.articlesLoadFailed' as const satisfies MessageKey;
const NO_ARTICLES_WON_MESSAGE =
  'errors.article.noArticlesWon' as const satisfies MessageKey;

export const useGetArticlesByAuctionIdAmount = (
  auctionId: string
): ActionResponse<number, MessageKey> => {
  const [wonArticle, setWonArticle] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticleBids = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<number>({
      endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES_BY_AUCTION_ID(auctionId),
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(ARTICLES_LOAD_ERROR);
      setWonArticle(0);
      return {
        message: ARTICLES_LOAD_ERROR,
      };
    }

    const articlesWon = res.data;
    if (!articlesWon) {
      setStatus(REQUEST_STATUS.error);
      setWonArticle(0);
      return {
        message: NO_ARTICLES_WON_MESSAGE,
      };
    }

    setWonArticle(articlesWon);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, auctionId]);

  useEffect(() => {
    fetchArticleBids();
  }, [fetchArticleBids]);

  return {
    data: wonArticle,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchArticleBids,
  };
};
