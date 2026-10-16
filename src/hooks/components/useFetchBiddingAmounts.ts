import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, BiddingAmounts, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../useToast';
import { useTranslation } from '../i18n/useTranslation';
import { t } from '@/i18n';
import type { MessageKey } from '@/i18n';

const PAGE_INFO_LOAD_ERROR =
  'errors.article.pageInfoLoadFailed' as const satisfies MessageKey;
const BIDDING_AMOUNTS_UPDATE_ERROR =
  'errors.bid.updateAmountsFailed' as const satisfies MessageKey;

export const useFetchBiddingAmounts = ({
  articleId,
  currentPrice,
  startingPrice,
}: {
  articleId: number | null;
  currentPrice: number | null;
  startingPrice: number | null;
}): Omit<ActionResponse<BiddingAmounts | null, MessageKey>, 'refetch'> & {
  refetch: (localCurrentPrice: number) => Promise<void>;
} => {
  const { locale } = useTranslation();
  const [data, setData] = useState<BiddingAmounts | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
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
      setErrorMessage(PAGE_INFO_LOAD_ERROR);
      return {
        message: PAGE_INFO_LOAD_ERROR,
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
          description: BIDDING_AMOUNTS_UPDATE_ERROR,
          actionLabel: t('commonErrors.retryButton', { locale }),
          onAction: () => refetchData(localCurrentPrice),
          durationMs: 7000,
        });
        setErrorMessage(PAGE_INFO_LOAD_ERROR);
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
