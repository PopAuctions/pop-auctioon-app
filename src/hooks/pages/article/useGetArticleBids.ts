import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Bids, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ARTICLE_BIDS_LOAD_ERROR =
  'errors.article.bidsLoadFailed' as const satisfies MessageKey;

export const useGetArticleBids = ({
  articleId,
  shouldFetch,
}: {
  articleId: number;
  shouldFetch: boolean;
}): ActionResponse<Bids[], MessageKey> => {
  const [article, setArticle] = useState<Bids[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticleBids = useCallback(async () => {
    setStatus('loading');

    const res = await protectedGet<Bids[]>({
      endpoint: `/articles/${articleId}/bids`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(ARTICLE_BIDS_LOAD_ERROR);
      return {
        message: ARTICLE_BIDS_LOAD_ERROR,
      };
    }

    setArticle(res.data || []);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, protectedGet]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchArticleBids();
  }, [articleId, fetchArticleBids, shouldFetch]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
  };
};
