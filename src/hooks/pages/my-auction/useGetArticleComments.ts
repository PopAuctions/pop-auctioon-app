import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Comment, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const COMMENTS_LOAD_ERROR =
  'errors.article.commentsLoadFailed' as const satisfies MessageKey;

export const useGetArticleComments = ({
  articleId,
  auctionId,
}: {
  articleId: string;
  auctionId: string;
}): ActionResponse<Comment[] | null, MessageKey> => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchComments = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<Comment[]>({
      endpoint: SECURE_ENDPOINTS.ARTICLES.COMMENTS(auctionId, articleId),
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(COMMENTS_LOAD_ERROR);
      return {
        message: COMMENTS_LOAD_ERROR,
      };
    }

    setComments(res.data || []);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, auctionId, secureGet]);

  useEffect(() => {
    fetchComments();
  }, [articleId, fetchComments]);

  return {
    data: comments,
    status,
    errorMessage,
    setErrorMessage,
  };
};
