import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  AuctionUserWonArticles,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

type ResponseType = Record<string, AuctionUserWonArticles> | null;

export const useGetWonArticlesByAuction = (): ActionResponse<ResponseType> => {
  const [wonArticle, setWonArticle] = useState<ResponseType>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchWonArticles = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<ResponseType>({
      endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES_BY_AUCTION,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching articles',
        es: 'Error al obtener los artículos',
      });
      setWonArticle(null);
      return {
        message: {
          en: 'Error fetching articles',
          es: 'Error al obtener los artículos',
        },
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
