/**
 * Hook para obtener artículos ganados en una subasta específica
 * Similar al patrón de Next.js web: getUserWonAuctionArticles
 */

import { useState, useCallback, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  UserArticlesWon,
} from '@/types/types';

interface UseGetWonArticlesProps {
  auctionId: string;
}

export const useGetWonArticles = ({
  auctionId,
}: UseGetWonArticlesProps): ActionResponse<UserArticlesWon[]> & {
  refetch: () => Promise<void>;
} => {
  const [articles, setArticles] = useState<UserArticlesWon[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchWonArticles = useCallback(async (): Promise<void> => {
    if (!auctionId) {
      setStatus('error');
      setErrorMessage({
        es: 'ID de subasta requerido',
        en: 'Auction ID required',
      });
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await secureGet<UserArticlesWon[]>({
        endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES(auctionId),
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (response.data) {
        setArticles(response.data);
        setStatus('success');
      } else {
        setArticles([]);
        setStatus('success');
      }
    } catch (error: any) {
      const errorMsg: LangMap = {
        es: 'Error al cargar artículos ganados',
        en: 'Error loading won articles',
      };
      setErrorMessage(errorMsg);
      setStatus('error');
    }
  }, [secureGet, auctionId]);

  useEffect(() => {
    fetchWonArticles();
  }, [fetchWonArticles]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchWonArticles,
  };
};
