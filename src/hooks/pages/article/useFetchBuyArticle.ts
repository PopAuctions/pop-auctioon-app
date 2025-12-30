import { useState, useCallback, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  UserArticlesWon,
} from '@/types/types';
import { REQUEST_STATUS } from '@/constants';

interface UseFetchBuyArticleProps {
  articleId: string;
}

interface BuyArticleResponse {
  article: UserArticlesWon | null;
  userLimitTime: string | null;
}

export const useFetchBuyArticle = ({
  articleId,
}: UseFetchBuyArticleProps): ActionResponse<BuyArticleResponse | null> => {
  const [data, setData] = useState<BuyArticleResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchBuyArticle = useCallback(async (): Promise<void> => {
    if (!articleId) {
      setStatus('error');
      setErrorMessage({
        es: 'ID de artículo requerido',
        en: 'Article ID required',
      });
      return;
    }

    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await secureGet<BuyArticleResponse>({
        endpoint: SECURE_ENDPOINTS.ARTICLES.BUY(articleId),
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return;
      }

      if (!response.data) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage({
          es: 'No se encontró información del artículo',
          en: 'Article information not found',
        });
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch {
      const errorMsg: LangMap = {
        es: 'Error al cargar información',
        en: 'Error loading information',
      };
      setErrorMessage(errorMsg);
      setStatus(REQUEST_STATUS.error);
    }
  }, [secureGet, articleId]);

  useEffect(() => {
    fetchBuyArticle();
  }, [fetchBuyArticle]);

  return {
    data: data,
    status,
    errorMessage,
    setErrorMessage,
  };
};
