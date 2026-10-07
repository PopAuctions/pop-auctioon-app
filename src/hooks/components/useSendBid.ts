import { useCallback, useMemo, useState } from 'react';
import { useSecureApi } from '../api/useSecureApi';
import { useToast } from '../useToast';
import { BiddingAmounts, HighestBidderState, LangMap } from '@/types/types';
import { euroFormatter } from '@/utils/euroFormatter';
import { useHighestBidderContext } from '@/context/highest-bidder-context';
import { toTotal } from '@/utils/toTotal';
import { MAX_BID_OFFSET } from '@/constants/bid';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useTranslation } from '../i18n/useTranslation';
import { useSignInAlertModal } from '@/context/sign-in-modal-context';
import { ceilToNearestTen } from '@/utils/ceilToNearestTen';
import type { MessageKey } from '@/i18n';

const maxBidOffset = MAX_BID_OFFSET;

const BID_STEP = 10;
const INVALID_BID_AMOUNT =
  'errors.bid.invalidAmount' as const satisfies MessageKey;
const BID_REQUEST_TIMEOUT =
  'errors.bid.requestTimeout' as const satisfies MessageKey;
const BID_PROCESSING_ERROR =
  'errors.bid.processingFailed' as const satisfies MessageKey;

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

  const { locale } = useTranslation();
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const formatter = useMemo(() => euroFormatter(locale), [locale]);
  const {
    minBid = 0,
    tenPercent = 0,
    twentyFivePercent = 0,
    fiftyPercent = 0,
  } = biddingAmounts;

  const { state } = useHighestBidderContext({
    initialValue: articleServerState,
    resetKey: articleId,
  });

  const { currentValue, available: articleAvailable } = state;

  const getCommissionInclusiveBid = useCallback(
    (increment: number) => {
      const baseAmount = currentValue + increment;
      const totalWithCommission = toTotal(baseAmount, commissionPercentage);

      return ceilToNearestTen(totalWithCommission);
    },
    [currentValue, commissionPercentage]
  );

  const computedMinBid = getCommissionInclusiveBid(minBid);

  const computedMaxBid = getCommissionInclusiveBid(fiftyPercent + maxBidOffset);

  const bidAmountNumber = bidAmount === '' ? null : Number(bidAmount);

  const isTooLow = bidAmountNumber !== null && bidAmountNumber < computedMinBid;

  const isTooHigh =
    bidAmountNumber !== null && bidAmountNumber > computedMaxBid;

  const canDecreaseBid =
    bidAmountNumber !== null && bidAmountNumber > computedMinBid && !isPending;

  const canIncreaseBid =
    (bidAmountNumber === null || bidAmountNumber < computedMaxBid) &&
    !isPending;

  const setAmountToBid = useCallback(
    (amountBase: number) => {
      const buyerAmount = getCommissionInclusiveBid(amountBase);

      setBidAmount(String(buyerAmount));
    },
    [getCommissionInclusiveBid]
  );

  const decreaseBidAmount = useCallback(() => {
    setBidAmount((currentAmount) => {
      /*
       * Both buttons initialize an empty input with the minimum bid.
       */
      if (currentAmount === '') {
        return String(computedMinBid);
      }

      const numericAmount = Number(currentAmount);

      if (
        !Number.isSafeInteger(numericAmount) ||
        numericAmount <= computedMinBid
      ) {
        return String(computedMinBid);
      }

      return String(Math.max(computedMinBid, numericAmount - BID_STEP));
    });
  }, [computedMinBid]);

  const increaseBidAmount = useCallback(() => {
    setBidAmount((currentAmount) => {
      /*
       * Both buttons initialize an empty input with the minimum bid.
       */
      if (currentAmount === '') {
        return String(computedMinBid);
      }

      const numericAmount = Number(currentAmount);

      if (!Number.isSafeInteger(numericAmount)) {
        return String(computedMinBid);
      }

      return String(Math.min(computedMaxBid, numericAmount + BID_STEP));
    });
  }, [computedMinBid, computedMaxBid]);

  const sendBid = async (customAmount?: number) => {
    const amount = customAmount ?? (bidAmount === '' ? NaN : Number(bidAmount));

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount % BID_STEP !== 0
    ) {
      callToast({
        variant: 'error',
        description: INVALID_BID_AMOUNT,
      });

      return;
    }

    if (amount < computedMinBid) {
      callToast({
        variant: 'error',
        description: {
          code: 'errors.bid.minimumAmount',
          params: { amount: formatter.format(computedMinBid) },
        },
      });

      return;
    }

    if (amount > computedMaxBid) {
      callToast({
        variant: 'error',
        description: {
          code: 'errors.bid.maximumAmount',
          params: { amount: formatter.format(computedMaxBid) },
        },
      });

      return;
    }

    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    try {
      setIsPending(true);

      timeoutHandle = setTimeout(() => {
        sentryErrorReport('Bid request timeout', 'SEND_BID_TIMEOUT_10S');

        setIsPending(false);

        callToast({
          variant: 'error',
          description: BID_REQUEST_TIMEOUT,
        });
      }, 10000);

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.BIDS.CREATE,
        data: {
          articleId,
          /*
           * This is the exact rounded buyer-facing amount.
           * The server resolves it back to the corresponding base value.
           */
          amount,
          clientCurrentAmount: currentValue,
        },
      });

      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }

      if (response.error) {
        if (response.status === 401) {
          openSignInAlertModal();
        }

        callToast({
          variant: 'error',
          description: response.error,
        });

        return;
      }

      callToast({
        variant: 'success',
        description: response.data,
      });

      setBidAmount('');
    } catch (error: unknown) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }

      sentryErrorReport(
        error instanceof Error ? error.message : String(error),
        'CATCH_CREATE_BID - Unexpected error'
      );

      callToast({
        variant: 'error',
        description: BID_PROCESSING_ERROR,
      });
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

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
    canDecreaseBid,
    canIncreaseBid,
    decreaseBidAmount,
    increaseBidAmount,
    setAmountToBid,
    sendBid,
    formatter,
    currentValue,
    computedMaxBid,
    computedMinBid,
    bidAmount,
  };
};
