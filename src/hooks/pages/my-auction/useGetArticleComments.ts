import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Comment, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetArticleComments = ({
  articleId,
  auctionId,
}: {
  articleId: string;
  auctionId: string;
}): ActionResponse<Comment[] | null> => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchComments = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<Comment[]>({
      endpoint: SECURE_ENDPOINTS.ARTICLES.COMMENTS(auctionId, articleId),
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching comments',
        es: 'Error al obtener comentarios',
      });
      return {
        message: {
          en: 'Error fetching comments',
          es: 'Error al obtener comentarios',
        },
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
