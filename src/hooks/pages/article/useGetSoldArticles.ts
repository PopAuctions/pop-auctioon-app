import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  CustomPaidArticle,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetSoldArticles = ({
  auctionId,
  status,
}: { auctionId?: string; status?: string } = {}): ActionResponse<
  CustomPaidArticle[]
> => {
  const [soldArticle, setSoldArticle] = useState<CustomPaidArticle[]>([]);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    REQUEST_STATUS.idle
  );
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchSoldArticles = useCallback(async () => {
    setRequestStatus(REQUEST_STATUS.loading);

    const queryParams = new URLSearchParams();
    if (auctionId) queryParams.append('auctionId', auctionId);
    if (status) queryParams.append('status', status);

    const res = await secureGet<CustomPaidArticle[]>({
      endpoint: `${SECURE_ENDPOINTS.USER.SOLD_ARTICLES}?${queryParams.toString()}`,
    });

    if (res.error) {
      setRequestStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching articles',
        es: 'Error al obtener los artículos',
      });
      setSoldArticle([]);
      return {
        message: {
          en: 'Error fetching articles',
          es: 'Error al obtener los artículos',
        },
      };
    }

    setSoldArticle(res.data ?? []);
    setRequestStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, auctionId, status]);

  useEffect(() => {
    fetchSoldArticles();
  }, [fetchSoldArticles]);

  return {
    data: soldArticle,
    status: requestStatus,
    errorMessage,
    setErrorMessage,
  };
};
