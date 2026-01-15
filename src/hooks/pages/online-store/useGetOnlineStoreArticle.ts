import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  CustomFullArticleSecondChance,
  LangMap,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetOnlineStoreArticle = ({
  articleId,
}: {
  articleId: number;
}): Omit<ActionResponse<CustomFullArticleSecondChance | null>, 'refetch'> & {
  refetch: () => RefetchReturn;
} => {
  const [article, setArticle] = useState<CustomFullArticleSecondChance | null>(
    null
  );
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<CustomFullArticleSecondChance>({
      endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.ARTICLE(articleId),
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching article',
        es: 'Error al obtener el artículo',
      });
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
      };
    }

    setArticle(res.data || null);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, secureGet]);

  const refetch = async () => {
    const res = await secureGet<CustomFullArticleSecondChance>({
      endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.ARTICLE(articleId),
    });

    if (res.error) {
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
      };
    }

    setArticle(res.data || null);

    return {
      message: {
        es: 'Artículo actualizado correctamente',
        en: 'Article updated successfully',
      },
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
