import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { REQUEST_STATUS } from '@/constants';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import {
  ActionResponse,
  CustomPaidArticleFull,
  CustomUser,
  RequestStatus,
} from '@/types/types';
import type { MessageKey } from '@/i18n';

const ARTICLE_LOAD_ERROR =
  'errors.article.loadFailed' as const satisfies MessageKey;

interface FetchSoldArticleResponse {
  article: CustomPaidArticleFull | null;
  secondHighestBidUser: CustomUser | null;
}

export const useGetSoldArticle = (
  articleId: string
): ActionResponse<FetchSoldArticleResponse | null, MessageKey> => {
  const [soldArticle, setSoldArticle] =
    useState<FetchSoldArticleResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchSoldArticle = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<FetchSoldArticleResponse | null>({
      endpoint: `${SECURE_ENDPOINTS.USER.SOLD_ARTICLE(articleId)}`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(ARTICLE_LOAD_ERROR);
      setSoldArticle(null);
      return {
        message: ARTICLE_LOAD_ERROR,
      };
    }

    setSoldArticle(res.data ?? null);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, articleId]);

  useEffect(() => {
    fetchSoldArticle();
  }, [fetchSoldArticle]);

  return {
    data: soldArticle,
    status: status,
    errorMessage,
    setErrorMessage,
  };
};
