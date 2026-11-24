import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, SimpleArticle, RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';

const MOST_VIEWED_ARTICLES_LOAD_ERROR =
  'errors.article.mostViewedArticlesLoadFailed' as const satisfies MessageKey;

export const useFetchMostViewedArticles = (): ActionResponse<
  SimpleArticle[],
  MessageKey
> => {
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchMostViewedArticles = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<SimpleArticle[]>({
      endpoint: `/articles/most-viewed`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(MOST_VIEWED_ARTICLES_LOAD_ERROR);
      return {
        message: MOST_VIEWED_ARTICLES_LOAD_ERROR,
      };
    }

    setArticles(res.data || []);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [protectedGet]);

  useEffect(() => {
    fetchMostViewedArticles();
  }, [fetchMostViewedArticles]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
  };
};
