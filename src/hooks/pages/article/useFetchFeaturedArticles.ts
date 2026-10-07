import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, SimpleArticle, RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';

const FEATURED_ARTICLES_LOAD_ERROR =
  'errors.article.featuredArticlesLoadFailed' as const satisfies MessageKey;

export const useFetchFeaturedArticles = (): ActionResponse<
  SimpleArticle[],
  MessageKey
> => {
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchFeaturedArticles = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<SimpleArticle[]>({
      endpoint: `/articles/featured`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(FEATURED_ARTICLES_LOAD_ERROR);
      return {
        message: FEATURED_ARTICLES_LOAD_ERROR,
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
    fetchFeaturedArticles();
  }, [fetchFeaturedArticles]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
  };
};
