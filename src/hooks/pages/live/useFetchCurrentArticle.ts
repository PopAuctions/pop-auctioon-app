import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  CustomArticleLiveAuto,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { SECURE_ENDPOINTS } from '@/config/api-config';

export const useFetchCurrentArticle = ({
  articleId,
}: {
  articleId: number;
}): ActionResponse<CustomArticleLiveAuto | null> => {
  const [article, setArticle] = useState<CustomArticleLiveAuto | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus('loading');

    const res = await protectedGet<CustomArticleLiveAuto>({
      endpoint: `${SECURE_ENDPOINTS.ARTICLES.ID(articleId)}`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching article information.',
        es: 'Error al obtener el artículo.',
      });
      return {
        message: {
          en: 'Error fetching article information.',
          es: 'Error al obtener el artículo.',
        },
      };
    }

    setArticle(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, protectedGet]);

  useEffect(() => {
    if (!articleId) return;

    fetchArticle();
  }, [articleId, fetchArticle]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
  };
};
