import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  ArticleSecondChanceWithOffers,
  LangMap,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetMyOnlineStoreLatestOffers = (): Omit<
  ActionResponse<ArticleSecondChanceWithOffers[]>,
  'refetch'
> & {
  refetch: () => RefetchReturn;
} => {
  const [article, setArticle] = useState<ArticleSecondChanceWithOffers[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);

    const res = await secureGet<ArticleSecondChanceWithOffers[]>({
      endpoint: '/my-online-store/offers',
    });

    if (res.error) {
      console.log(res.error);
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching offers',
        es: 'Error al obtener las ofertas',
      });
      return {
        message: {
          en: 'Error fetching offers',
          es: 'Error al obtener las ofertas',
        },
      };
    }

    if (!res.data) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching offers',
        es: 'Error al obtener las ofertas',
      });
      return {
        message: {
          en: 'Error fetching offers',
          es: 'Error al obtener las ofertas',
        },
      };
    }

    setArticle(res.data);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetch = async () => {
    const res = await secureGet<ArticleSecondChanceWithOffers[]>({
      endpoint: '/my-online-store/offers',
    });

    if (res.error || !res.data) {
      return {
        message: {
          en: 'Error fetching offers',
          es: 'Error al actualizar las ofertas',
        },
      };
    }

    setArticle(res.data);

    return {
      message: {
        es: 'Ofertas actualizadas',
        en: 'Offers updated',
      },
    };
  };

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
    refetch,
  };
};
