import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetArticlesUserFollows = (): ActionResponse<number[]> => {
  const [followedArticles, setFollowedArticles] = useState<number[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const getUserFollows = useCallback(async () => {
    try {
      setStatus('loading');
      const res = await secureGet<number[]>({
        endpoint: `/articles/user-follows`,
      });

      if (res.error) {
        setStatus('error');
        setFollowedArticles([]);
        setErrorMessage(res.error);
        return {
          message: {
            en: 'Error fetching user information',
            es: 'Error al obtener la información del usuario',
          },
        };
      }

      const followedArticles = res.data;

      setStatus('success');
      setFollowedArticles(followedArticles ?? []);

      return {
        error: null,
        followedArticles,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMessage,
        'GET_USER_FOLLOWS_ARTICLES - Unexpected error'
      );

      console.error('Unexpected error fetching articles:', errorMessage);

      return {
        message: {
          en: 'Error fetching user information',
          es: 'Error al obtener la información del usuario',
        },
      };
    }
  }, [secureGet]);

  useEffect(() => {
    getUserFollows();
  }, [getUserFollows]);

  return {
    data: followedArticles,
    status,
    errorMessage,
    setErrorMessage,
  };
};
