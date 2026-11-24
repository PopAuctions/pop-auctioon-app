import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  CustomArticleSecondChance,
  RequestStatus,
} from '@/types/types';
import type { MessageKey } from '@/i18n';

const NEWEST_ARTICLES_LOAD_ERROR =
  'errors.article.newestArticlesLoadFailed' as const satisfies MessageKey;

export const useFetchNewestArticlesOnlineStore = (): ActionResponse<
  CustomArticleSecondChance[],
  MessageKey
> => {
  const [articles, setArticles] = useState<CustomArticleSecondChance[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchNewestArticles = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<CustomArticleSecondChance[]>({
      endpoint: `/online-store/articles/latest`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(NEWEST_ARTICLES_LOAD_ERROR);
      return {
        message: NEWEST_ARTICLES_LOAD_ERROR,
      };
    }

    setArticles(res.data || []);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [protectedGet]);

  useEffect(() => {
    fetchNewestArticles();
  }, [fetchNewestArticles]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
  };
};
