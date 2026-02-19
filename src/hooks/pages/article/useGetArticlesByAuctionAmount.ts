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

export const useGetArticlesByAuctionAmount = (): ActionResponse<number> => {
  const [wonArticle, setWonArticle] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticleBids = useCallback(async () => {
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
      setWonArticle(0);
      return {
        message: {
          en: 'No articles won',
          es: 'No hay artículos ganados',
        },
      };
    }

    const auctions = Object.keys(articlesWon);
    if (auctions.length === 0) {
      setWonArticle(0);
      return {
        message: {
          en: 'No articles won',
          es: 'No hay artículos ganados',
        },
      };
    }

    const totalArticles = auctions.reduce((total, auctionId) => {
      return total + (articlesWon[auctionId]?.articles?.length || 0);
    }, 0);

    setWonArticle(totalArticles);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  useEffect(() => {
    fetchArticleBids();
  }, [fetchArticleBids]);

  return {
    data: wonArticle,
    status,
    errorMessage,
    setErrorMessage,
  };
};
