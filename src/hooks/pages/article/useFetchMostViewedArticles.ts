import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  SimpleArticle,
  LangMap,
  RequestStatus,
} from '@/types/types';

export const useFetchMostViewedArticles = (): ActionResponse<
  SimpleArticle[]
> => {
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchMostViewedArticles = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<SimpleArticle[]>({
      endpoint: `/articles/most-viewed`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching most viewed articles',
        es: 'Error al obtener los artículos más vistos',
      });
      return {
        message: {
          en: 'Error fetching most viewed articles',
          es: 'Error al obtener los artículos más vistos',
        },
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
