import { useState, useCallback, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  RequestStatus,
  UserArticlesWon,
} from '@/types/types';
import { REQUEST_STATUS } from '@/constants';
import type { MessageKey } from '@/i18n';

interface UseFetchBuyArticleProps {
  articleId: string;
}

interface BuyArticleResponse {
  article: UserArticlesWon | null;
  userLimitTime: string | null;
}

const BUY_ARTICLE_ID_REQUIRED =
  'commonErrors.articleIdRequired' as const satisfies MessageKey;
const BUY_ARTICLE_DATA_MISSING =
  'errors.offer.buyDataMissing' as const satisfies MessageKey;
const BUY_ARTICLE_LOAD_FAILED =
  'errors.offer.buyLoadFailed' as const satisfies MessageKey;

export const useFetchBuyArticle = ({
  articleId,
}: UseFetchBuyArticleProps): ActionResponse<
  BuyArticleResponse | null,
  MessageKey
> => {
  const [data, setData] = useState<BuyArticleResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchBuyArticle = useCallback(async (): Promise<void> => {
    if (!articleId) {
      setStatus('error');
      setErrorMessage(BUY_ARTICLE_ID_REQUIRED);
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
        setErrorMessage(response.messageCode ?? BUY_ARTICLE_LOAD_FAILED);
        return;
      }

      if (!response.data) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(BUY_ARTICLE_DATA_MISSING);
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch {
      setErrorMessage(BUY_ARTICLE_LOAD_FAILED);
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
    refetch: fetchBuyArticle,
  };
};
