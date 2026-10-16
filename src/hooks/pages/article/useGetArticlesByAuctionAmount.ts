import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  AuctionUserWonArticles,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ARTICLES_LOAD_ERROR =
  'errors.article.articlesLoadFailed' as const satisfies MessageKey;
const NO_ARTICLES_WON_MESSAGE =
  'errors.article.noArticlesWon' as const satisfies MessageKey;

type ResponseType = Record<string, AuctionUserWonArticles> | null;

export const useGetArticlesByAuctionAmount = (): ActionResponse<
  number,
  MessageKey
> => {
  const [wonArticle, setWonArticle] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticleBids = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<ResponseType>({
      endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES_BY_AUCTION,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(ARTICLES_LOAD_ERROR);
      setWonArticle(0);
      return {
        message: ARTICLES_LOAD_ERROR,
      };
    }

    const articlesWon = res.data;
    if (!articlesWon) {
      setStatus('error');
      setWonArticle(0);
      return {
        message: NO_ARTICLES_WON_MESSAGE,
      };
    }

    const auctions = Object.keys(articlesWon);
    if (auctions.length === 0) {
      setStatus('error');
      setWonArticle(0);
      return {
        message: NO_ARTICLES_WON_MESSAGE,
      };
    }

    const totalArticles = auctions.reduce((total, auctionId) => {
      return total + (articlesWon[auctionId]?.articles?.length || 0);
    }, 0);

    setWonArticle(totalArticles);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

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
