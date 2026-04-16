import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Bids, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetArticleBids = ({
  articleId,
  shouldFetch,
}: {
  articleId: number;
  shouldFetch: boolean;
}): ActionResponse<Bids[]> => {
  const [article, setArticle] = useState<Bids[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticleBids = useCallback(async () => {
    setStatus('loading');

    const res = await protectedGet<Bids[]>({
      endpoint: `/articles/${articleId}/bids`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching article bids',
        es: 'Error al obtener las pujas del artículo',
      });
      return {
        message: {
          en: 'Error fetching article bids',
          es: 'Error al obtener las pujas del artículo',
        },
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
