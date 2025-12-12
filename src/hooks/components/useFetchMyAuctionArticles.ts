import {
  ActionResponse,
  LangMap,
  RequestStatus,
  type Article,
} from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

export const useFetchMyAuctionArticles = ({
  auctionId,
  name,
}: {
  auctionId: string;
  name?: string;
}): ActionResponse<Article[]> & {
  refetch: () => Promise<void>;
} => {
  const [data, setData] = useState<Article[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticles = useCallback(async () => {
    try {
      setStatus('loading');
      const params = new URLSearchParams();

      if (name) params.append('name', name);

      const response = await protectedGet<Article[]>({
        endpoint: SECURE_ENDPOINTS.AUCTIONS.ARTICLES(
          auctionId,
          params.toString()
        ),
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      setData(response.data ?? []);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_MY_AUCTION_ARTICLES - Unexpected error'
      );

      console.error('ERROR_USE_FETCH_MY_AUCTION_ARTICLES', errorMsg);

      const message: LangMap = {
        en: 'Error loading auction articles',
        es: 'Error al cargar los artículos de la subasta',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [protectedGet, auctionId, name]);

  const refetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (name) params.append('name', name);

      const response = await protectedGet<Article[]>({
        endpoint: SECURE_ENDPOINTS.AUCTIONS.ARTICLES(
          auctionId,
          params.toString()
        ),
      });

      if (response.error) {
        return;
      }

      setData(response.data ?? []);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_MY_AUCTION_ARTICLES - Unexpected error'
      );
    }
  }, [protectedGet, auctionId, name]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles, name]);

  return {
    data,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchArticles,
  };
};
