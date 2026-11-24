import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { ActionResponse, Article, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

interface CustomArticle {
  id: string;
  Article: Article & { ArticleBid: { currentValue: number } };
}

const FOLLOWED_ARTICLES_LOAD_ERROR =
  'errors.article.followedArticlesLoadFailed' as const satisfies MessageKey;

export const useGetFollowedArticles = (): ActionResponse<
  CustomArticle[] | null,
  MessageKey
> => {
  const [articles, setArticles] = useState<CustomArticle[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchFollowedArticles = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<CustomArticle[]>({
      endpoint: SECURE_ENDPOINTS.ARTICLES.FOLLOWED_ARTICLES,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(FOLLOWED_ARTICLES_LOAD_ERROR);
      return {
        message: FOLLOWED_ARTICLES_LOAD_ERROR,
      };
    }

    setArticles(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchFollowedArticles = useCallback(async () => {
    const res = await secureGet<CustomArticle[]>({
      endpoint: SECURE_ENDPOINTS.ARTICLES.FOLLOWED_ARTICLES,
    });

    if (res.error) {
      return {
        message: FOLLOWED_ARTICLES_LOAD_ERROR,
      };
    }

    setArticles(res.data || null);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  useEffect(() => {
    fetchFollowedArticles();
  }, [fetchFollowedArticles]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchFollowedArticles,
  };
};
