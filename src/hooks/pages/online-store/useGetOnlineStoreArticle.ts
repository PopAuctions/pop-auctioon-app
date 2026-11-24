import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  CustomFullArticleSecondChance,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ARTICLE_LOAD_ERROR =
  'errors.article.loadFailed' as const satisfies MessageKey;
const ARTICLE_REFRESHED =
  'article.refreshedSuccessfully' as const satisfies MessageKey;

export const useGetOnlineStoreArticle = ({
  articleId,
}: {
  articleId: number;
}): Omit<
  ActionResponse<CustomFullArticleSecondChance | null, MessageKey>,
  'refetch'
> & {
  refetch: () => RefetchReturn<MessageKey>;
} => {
  const [article, setArticle] = useState<CustomFullArticleSecondChance | null>(
    null
  );
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await protectedGet<CustomFullArticleSecondChance>({
      endpoint: `/online-store/articles/${articleId}`,
    });
    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(ARTICLE_LOAD_ERROR);
      return {
        message: ARTICLE_LOAD_ERROR,
      };
    }

    setArticle(res.data || null);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, protectedGet]);

  const refetch = async () => {
    const res = await protectedGet<CustomFullArticleSecondChance>({
      endpoint: `/online-store/articles/${articleId}`,
    });

    if (res.error) {
      return {
        message: ARTICLE_LOAD_ERROR,
      };
    }

    setArticle(res.data || null);

    return {
      message: ARTICLE_REFRESHED,
    };
  };

  useEffect(() => {
    fetchArticle();
  }, [articleId, fetchArticle]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
    refetch,
  };
};
