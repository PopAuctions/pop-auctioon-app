import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  BiddingAmounts,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useFetchBiddingAmounts = ({
  articleId,
  currentPrice,
  startingPrice,
}: {
  articleId: number | null;
  currentPrice: number | null;
  startingPrice: number | null;
}): Omit<ActionResponse<BiddingAmounts | null>, 'refetch'> => {
  const [data, setData] = useState<BiddingAmounts | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchData = useCallback(async () => {
    setStatus('loading');
    const params = new URLSearchParams();

    if (articleId) params.append('articleId', String(articleId));
    if (currentPrice) params.append('currentPrice', String(currentPrice));
    if (startingPrice) params.append('startingPrice', String(startingPrice));

    const res = await protectedGet<BiddingAmounts>({
      endpoint: `/bids/bidding-amounts?${params}`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching page info',
        es: 'Error al obtener información de la página',
      });
      return {
        message: {
          en: 'Error fetching page info',
          es: 'Error al obtener información de la página',
        },
      };
    }

    const resData = res.data;
    if (!resData) {
      fetchData();
      return;
    }

    setData(resData);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, currentPrice, startingPrice, protectedGet]);

  useEffect(() => {
    if (!articleId || !currentPrice || !startingPrice) return;

    fetchData();
  }, [articleId, currentPrice, startingPrice, fetchData]);

  return { data, status, errorMessage, setErrorMessage };
};
