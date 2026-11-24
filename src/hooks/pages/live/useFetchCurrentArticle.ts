import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  CustomArticleLiveAuto,
  RequestStatus,
} from '@/types/types';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { MessageKey } from '@/i18n';

const CURRENT_ARTICLE_LOAD_ERROR =
  'errors.live.currentArticleLoadFailed' as const satisfies MessageKey;

export const useFetchCurrentArticle = ({
  articleId,
}: {
  articleId: number;
}): ActionResponse<CustomArticleLiveAuto | null, MessageKey> => {
  const [article, setArticle] = useState<CustomArticleLiveAuto | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus('loading');

    const res = await protectedGet<CustomArticleLiveAuto>({
      endpoint: `${SECURE_ENDPOINTS.ARTICLES.ID(articleId)}`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(CURRENT_ARTICLE_LOAD_ERROR);
      return {
        message: CURRENT_ARTICLE_LOAD_ERROR,
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
