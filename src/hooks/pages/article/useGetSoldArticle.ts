import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { REQUEST_STATUS } from '@/constants';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import {
  ActionResponse,
  CustomPaidArticleFull,
  CustomUser,
  LangMap,
  RequestStatus,
} from '@/types/types';

interface FetchSoldArticleResponse {
  article: CustomPaidArticleFull | null;
  secondHighestBidUser: CustomUser | null;
}

export const useGetSoldArticle = (
  articleId: string
): ActionResponse<FetchSoldArticleResponse | null> => {
  const [soldArticle, setSoldArticle] =
    useState<FetchSoldArticleResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchSoldArticle = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<FetchSoldArticleResponse | null>({
      endpoint: `${SECURE_ENDPOINTS.USER.SOLD_ARTICLE(articleId)}`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching article',
        es: 'Error al obtener el artículo',
      });
      setSoldArticle(null);
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
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
