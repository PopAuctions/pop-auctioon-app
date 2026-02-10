import { useMemo, useState } from 'react';
import { useSecureApi } from '../api/useSecureApi';
import { useToast } from '../useToast';
import { BiddingAmounts, HighestBidderState, LangMap } from '@/types/types';
import { euroFormatter } from '@/utils/euroFormatter';
import { useHighestBidderContext } from '@/context/highest-bidder-context';
import { toTotal } from '@/utils/toTotal';
import { MAX_BID_OFFSET } from '@/constants/bid';
import { ONLY_INTEGERS_REGEX } from '@/constants';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useTranslation } from '../i18n/useTranslation';
import { useSignInAlertModal } from '@/context/sign-in-modal-context';

const maxBidOffset = MAX_BID_OFFSET;

export const useSendBid = ({
  biddingAmounts,
  articleServerState,
  articleId,
  commissionPercentage,
}: {
  biddingAmounts: BiddingAmounts;
  articleServerState: HighestBidderState;
  articleId: number;
  commissionPercentage: number;
}) => {
  const { openSignInAlertModal } = useSignInAlertModal();
  const [isPending, setIsPending] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const { t, locale } = useTranslation();
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const formatter = useMemo(() => euroFormatter(locale), [locale]);
  const bidlocale = t('components.bid');

  const { minBid, tenPercent, twentyFivePercent, fiftyPercent } =
    biddingAmounts;

  const { state } = useHighestBidderContext({
    initialValue: articleServerState,
    resetKey: articleId,
  });
  const { currentValue, available: articleAvailable } = state;

  const computedMinBid = useMemo(
    () => toTotal(minBid + currentValue, commissionPercentage),
    [minBid, currentValue, commissionPercentage]
  );
  const computedMaxBid = useMemo(
    () =>
      toTotal(fiftyPercent + currentValue + maxBidOffset, commissionPercentage),
    [fiftyPercent, currentValue, commissionPercentage]
  );

  const isTooLow = useMemo(
    () => parseInt(bidAmount) < computedMinBid,
    [bidAmount, computedMinBid]
  );
  const isTooHigh = useMemo(
    () => parseInt(bidAmount) > computedMaxBid,
    [bidAmount, computedMaxBid]
  );

  const setAmountToBid = (amountBase: number) => {
    const finalBase = amountBase + currentValue;
    const total = toTotal(finalBase, commissionPercentage);
    setBidAmount(String(total));
  };

  const handleInputChange = (value: string) => {
    const numericValue = Number(value);

    if (
      value !== '' &&
      (numericValue <= 0 ||
        !Number.isInteger(numericValue) ||
        value.includes('-'))
    ) {
      return;
    }

    if (value === '' || ONLY_INTEGERS_REGEX.test(value)) {
      setBidAmount(value);
    }
  };

  const sendBid = async (customAmount?: number) => {
    const amount = customAmount ?? parseInt(bidAmount);

    if (amount < computedMinBid) {
      const message = bidlocale.minBid + ' ' + formatter.format(computedMinBid);
      callToast({
        variant: 'error',
        description: { es: message, en: message },
      });

      return;
    }

    // enforce max
    if (amount > computedMaxBid) {
      const message = bidlocale.maxBid + ' ' + formatter.format(computedMaxBid);
      callToast({
        variant: 'error',
        description: { es: message, en: message },
      });

      return;
    }

    // actual request
    try {
      setIsPending(true);

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.BIDS.CREATE,
        data: {
          articleId,
          amount: amount,
          clientCurrentAmount: currentValue,
        },
      });

      const data = response?.data;

      if (response.error) {
        if (response.status === 401) {
          openSignInAlertModal();
        }
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({ variant: 'success', description: data });
      setBidAmount('');
    } catch (e: any) {
      sentryErrorReport(e?.message, 'CATCH_CREATE_BID - Unexpected error');
      callToast({
        variant: 'error',
        description: {
          en: 'The bid could not be processed',
          es: 'La puja no pudo ser procesada',
        },
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    minBid,
    tenPercent,
    twentyFivePercent,
    fiftyPercent,
    articleAvailable,
    isTooLow,
    isTooHigh,
    setAmountToBid,
    handleInputChange,
    sendBid,
    formatter,
    currentValue,
    computedMaxBid,
    computedMinBid,
    bidAmount,
  };
};
