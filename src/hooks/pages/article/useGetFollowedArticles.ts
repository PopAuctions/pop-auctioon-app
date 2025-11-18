import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Article, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface CustomArticle {
  id: string;
  Article: Article & { ArticleBid: { currentValue: number } };
}

export const useGetFollowedArticles = (): ActionResponse<
  CustomArticle[] | null
> => {
  const [articles, setArticles] = useState<CustomArticle[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchFollowedArticles = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<CustomArticle[]>({
      endpoint: SECURE_ENDPOINTS.ARTICLES.FOLLOWED_ARTICLES,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching article',
        es: 'Error al obtener el artículo',
      });
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
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
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
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
