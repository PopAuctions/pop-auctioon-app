import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  CustomFullArticleSecondChance,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetOnlineStoreArticle = ({
  articleId,
}: {
  articleId: number;
}): ActionResponse<CustomFullArticleSecondChance | null> => {
  const [article, setArticle] = useState<CustomFullArticleSecondChance | null>(
    null
  );
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus('loading');

    const res = await protectedGet<CustomFullArticleSecondChance>({
      endpoint: `/online-store/articles/${articleId}`,
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

    setArticle(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, protectedGet]);

  const refetch = async () => {
    const res = await protectedGet<CustomFullArticleSecondChance>({
      endpoint: `/online-store/articles/${articleId}`,
    });

    if (res.error) {
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
      };
    }

    setArticle(res.data || null);

    return {
      error: null,
      success: null,
      res,
    };
  };

  useEffect(() => {
    fetchArticle();
  }, [articleId, fetchArticle]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
    refetch,
  };
};
