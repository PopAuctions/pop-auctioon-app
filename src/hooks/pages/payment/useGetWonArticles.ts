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
  RequestStatus,
  UserArticlesWon,
} from '@/types/types';
import type { MessageKey } from '@/i18n';
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
}: UseGetWonArticlesProps): ActionResponse<
  ArticlesResponse | null,
  MessageKey
> & {
  refetch: () => Promise<void>;
} => {
  const [articles, setArticles] = useState<ArticlesResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchWonArticles = useCallback(async (): Promise<void> => {
    if (!auctionId) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage('errors.payment.auctionIdRequired');
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
        setErrorMessage(
          response.messageCode ?? 'errors.payment.wonArticlesLoadFailed'
        );
        return;
      }

      if (response.data) {
        setArticles(response.data);
        setStatus(REQUEST_STATUS.success);
      } else {
        setErrorMessage('errors.payment.wonArticlesLoadFailed');
        setArticles(null);
        setStatus(REQUEST_STATUS.error);
      }
    } catch {
      setErrorMessage('errors.payment.wonArticlesLoadFailed');
      setStatus(REQUEST_STATUS.error);
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
