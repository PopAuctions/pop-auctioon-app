import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetArticlesByAuctionIdAmount = (
  auctionId: string
): ActionResponse<number> => {
  const [wonArticle, setWonArticle] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticleBids = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<number>({
      endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES_BY_AUCTION_ID(auctionId),
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching articles',
        es: 'Error al obtener los artículos',
      });
      setWonArticle(0);
      return {
        message: {
          en: 'Error fetching articles',
          es: 'Error al obtener los artículos',
        },
      };
    }

    const articlesWon = res.data;
    if (!articlesWon) {
      setStatus(REQUEST_STATUS.error);
      setWonArticle(0);
      return {
        message: {
          en: 'No articles won',
          es: 'No hay artículos ganados',
        },
      };
    }

    setWonArticle(articlesWon);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, auctionId]);

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
