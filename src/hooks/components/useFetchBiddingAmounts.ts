import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  BiddingAmounts,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../useToast';
import { useTranslation } from '../i18n/useTranslation';

const TEXTS = {
  es: {
    retry: 'Reintentar',
  },
  en: {
    retry: 'Retry',
  },
};

export const useFetchBiddingAmounts = ({
  articleId,
  currentPrice,
  startingPrice,
}: {
  articleId: number | null;
  currentPrice: number | null;
  startingPrice: number | null;
}): Omit<ActionResponse<BiddingAmounts | null>, 'refetch'> & {
  refetch: (localCurrentPrice: number) => Promise<void>;
} => {
  const { locale } = useTranslation();
  const [data, setData] = useState<BiddingAmounts | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();
  const { callToast } = useToast(locale);

  const fetchData = useCallback(async () => {
    setStatus('loading');
    const params = new URLSearchParams();

    if (articleId) params.append('articleId', String(articleId));
    if (currentPrice !== null && currentPrice !== undefined)
      params.append('currentPrice', String(currentPrice));
    if (startingPrice !== null && startingPrice !== undefined)
      params.append('startingPrice', String(startingPrice));

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

  const refetchData = useCallback(
    async (localCurrentPrice: number): Promise<void> => {
      const params = new URLSearchParams();

      if (articleId) params.append('articleId', String(articleId));
      params.append('currentPrice', String(localCurrentPrice));
      if (startingPrice) params.append('startingPrice', String(startingPrice));

      const res = await protectedGet<BiddingAmounts>({
        endpoint: `/bids/bidding-amounts?${params}`,
      });

      if (res.error) {
        callToast({
          variant: 'error',
          description: {
            en: 'Error updating bidding amounts. Click to retry.',
            es: 'Error al actualizar los montos de la puja. Haz clic para reintentar.',
          },
          actionLabel: TEXTS[locale].retry,
          onAction: () => refetchData(localCurrentPrice),
          durationMs: 7000,
        });
        setErrorMessage({
          en: 'Error fetching page info',
          es: 'Error al obtener información de la página',
        });
        return;
      }

      const resData = res.data;
      if (!resData) return;

      setData(resData);
    },
    [articleId, startingPrice, protectedGet, callToast, locale]
  );

  useEffect(() => {
    if (
      !articleId ||
      currentPrice === null ||
      currentPrice === undefined ||
      !startingPrice
    )
      return;

    fetchData();
  }, [articleId, currentPrice, startingPrice, fetchData]);

  return { data, status, errorMessage, setErrorMessage, refetch: refetchData };
};
