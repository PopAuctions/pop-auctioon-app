/**
 * Hook para obtener artículos ganados en una subasta específica
 * Similar al patrón de Next.js web: getUserWonAuctionArticles
 */

import { useState, useCallback, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  CountryValue,
  LangMap,
  RequestStatus,
  UserArticlesWon,
} from '@/types/types';
import { REQUEST_STATUS } from '@/constants';

interface UseGetWonArticlesProps {
  auctionId: string;
}

interface ArticlesResponse {
  articlesWon: UserArticlesWon[];
  country: CountryValue;
}

export const useGetWonArticles = ({
  auctionId,
}: UseGetWonArticlesProps): ActionResponse<ArticlesResponse> & {
  refetch: () => Promise<void>;
} => {
  const [articles, setArticles] = useState<ArticlesResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchWonArticles = useCallback(async (): Promise<void> => {
    if (!auctionId) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        es: 'ID de subasta requerido',
        en: 'Auction ID required',
      });
      return;
    }

    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await secureGet<ArticlesResponse>({
        endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES(auctionId),
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return;
      }

      if (response.data) {
        setErrorMessage({
          es: 'Error al cargar artículos ganados',
          en: 'Error loading won articles',
        });
        setArticles(response.data);
        setStatus(REQUEST_STATUS.success);
      } else {
        setArticles(null);
        setStatus(REQUEST_STATUS.error);
      }
    } catch {
      const errorMsg: LangMap = {
        es: 'Error al cargar artículos ganados',
        en: 'Error loading won articles',
      };
      setErrorMessage(errorMsg);
      setStatus(REQUEST_STATUS.error);
    }
  }, [secureGet, auctionId]);

  useEffect(() => {
    fetchWonArticles();
  }, [fetchWonArticles]);

  return {
    data: articles as ArticlesResponse,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchWonArticles,
  };
};
