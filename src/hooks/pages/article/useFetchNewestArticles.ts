import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  SimpleArticle,
  LangMap,
  RequestStatus,
} from '@/types/types';

export const useFetchNewestArticles = (): ActionResponse<SimpleArticle[]> => {
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchNewestArticles = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<SimpleArticle[]>({
      endpoint: `/articles/newest`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching newest articles',
        es: 'Error al obtener los artículos más recientes',
      });
      return {
        message: {
          en: 'Error fetching newest articles',
          es: 'Error al obtener los artículos más recientes',
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
    fetchNewestArticles();
  }, [fetchNewestArticles]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
  };
};
