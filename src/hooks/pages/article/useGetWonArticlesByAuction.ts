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

type ResponseType = Record<string, AuctionUserWonArticles> | null;

export const useGetWonArticlesByAuction = (): ActionResponse<
  ResponseType,
  MessageKey
> => {
  const [wonArticle, setWonArticle] = useState<ResponseType>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchWonArticles = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<ResponseType>({
      endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES_BY_AUCTION,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(ARTICLES_LOAD_ERROR);
      setWonArticle(null);
      return {
        message: ARTICLES_LOAD_ERROR,
      };
    }

    setWonArticle(res.data ?? null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  useEffect(() => {
    fetchWonArticles();
  }, [fetchWonArticles]);

  return {
    data: wonArticle,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchWonArticles,
  };
};
