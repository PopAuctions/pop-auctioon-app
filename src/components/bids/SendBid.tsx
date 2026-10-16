import { View } from 'react-native';
import type { BiddingAmounts, HighestBidderState } from '@/types/types';
import type { MessageKey, Translations } from '@/i18n';
import { CustomText } from '../ui/CustomText';
import { Button } from '../ui/Button';
import { toTotal } from '@/utils/toTotal';
import { useSendBid } from '@/hooks/components/useSendBid';
import { AMOUNT_PLACEHOLDER } from '@/constants';
import { AutomaticBidModal } from '../modal/AutomaticBidModal';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { useUpsertAutoBid } from '@/hooks/pages/auto-bid/useUpsertAutoBid';
import { ceilToNearestTen } from '@/utils/ceilToNearestTen';
import { BidAmountStepper } from './BidAmountStepper';
const AUTOMATIC_BID_ERROR =
  'errors.bid.automaticBidFailed' as const satisfies MessageKey;

type DictionaryTypeBid = Translations['es']['components']['bid'];

interface SendBidProps {
  articleServerState: HighestBidderState;
  articleId: number;
  bidLang: DictionaryTypeBid;
  biddingAmounts?: BiddingAmounts;
  commissionPercentage: number | null;
  autoBidsAmount: number;
}

export function SendBid({
  articleId,
  bidLang,
  articleServerState,
  biddingAmounts = {} as BiddingAmounts,
  commissionPercentage,
  autoBidsAmount,
}: SendBidProps) {
  const { upsertAutoBid } = useUpsertAutoBid();
  const { locale, t } = useTranslation();
  const modalTexts = t('components.modals.automaticBid');
  const [automaticBidModalVisible, setAutomaticBidModalVisible] =
    useState(false);
  const [isAutomaticBidPending, setIsAutomaticBidPending] = useState(false);
  const { callToast } = useToast(locale);
  const safeCommission = commissionPercentage ?? 0;

  const amountsReady =
    Number.isFinite(biddingAmounts?.tenPercent) &&
    Number.isFinite(biddingAmounts?.twentyFivePercent) &&
    Number.isFinite(biddingAmounts?.fiftyPercent);

  const {
    currentValue,
    isPending,
    computedMaxBid,
    computedMinBid,
    bidAmount,
    tenPercent,
    twentyFivePercent,
    fiftyPercent,
    articleAvailable,
    isTooLow,
    canDecreaseBid,
    canIncreaseBid,
    decreaseBidAmount,
    increaseBidAmount,
    setAmountToBid,
    sendBid,
    formatter,
  } = useSendBid({
    biddingAmounts,
    articleServerState,
    articleId,
    commissionPercentage: safeCommission,
  });

  const isReady =
    Number.isFinite(safeCommission) &&
    Number.isFinite(currentValue) &&
    amountsReady;

  const createAutomaticBid = async (amount: string) => {
    if (Number(amount) < computedMinBid) {
      callToast({
        variant: 'error',
        description: {
          code: 'errors.bid.minimumAmount',
          params: { amount: formatter.format(computedMinBid) },
        },
      });

      return false;
    }

    setIsAutomaticBidPending(true);
    try {
      const data = await upsertAutoBid({
        articleId: Number(articleId),
        maxAmount: Number(amount),
      });

      if (data.error) {
        callToast({ variant: 'error', description: data.error });
        return false;
      }

      callToast({ variant: 'success', description: data.success });
      return true;
    } catch (e) {
      callToast({
        variant: 'error',
        description: AUTOMATIC_BID_ERROR,
      });

      sentryErrorReport(
        e instanceof Error ? e.message : String(e),
        'CATCH_CREATE_AUTOMATIC_BID - Unexpected error'
      );

      return false;
    } finally {
      setIsAutomaticBidPending(false);
    }
  };

  return (
    <View className='w-full rounded-xl border border-neutral-200 bg-white p-4'>
      <View className='flex w-full flex-col gap-3'>
        <View className='flex flex-col gap-2'>
          <CustomText type='h4'>{bidLang.bid}</CustomText>

          <View className='flex w-full flex-row gap-2'>
            <Button
              mode='secondary'
              size='small'
              className='flex-1'
              disabled={!articleAvailable || !isReady}
              onPress={() => {
                setAmountToBid(tenPercent);
              }}
            >
              {!isReady
                ? AMOUNT_PLACEHOLDER
                : formatter.format(
                    ceilToNearestTen(
                      toTotal(tenPercent + currentValue, safeCommission)
                    )
                  )}
            </Button>

            <Button
              mode='secondary'
              size='small'
              className='flex-1'
              disabled={!articleAvailable || !isReady}
              onPress={() => {
                setAmountToBid(twentyFivePercent);
              }}
            >
              {!isReady
                ? AMOUNT_PLACEHOLDER
                : formatter.format(
                    ceilToNearestTen(
                      toTotal(twentyFivePercent + currentValue, safeCommission)
                    )
                  )}
            </Button>

            <Button
              mode='secondary'
              size='small'
              className='flex-1'
              disabled={!articleAvailable || !isReady}
              onPress={() => {
                setAmountToBid(fiftyPercent);
              }}
            >
              {!isReady
                ? AMOUNT_PLACEHOLDER
                : formatter.format(
                    ceilToNearestTen(
                      toTotal(fiftyPercent + currentValue, safeCommission)
                    )
                  )}
            </Button>
          </View>
        </View>

        <View className='w-full'>
          <CustomText
            type='bodysmall'
            className='text-[#787878]'
          >
            {bidLang.anyBidAmount}
          </CustomText>

          <BidAmountStepper
            value={bidAmount}
            placeholder={AMOUNT_PLACEHOLDER}
            disabled={!articleAvailable || !isReady || isPending}
            canDecrease={canDecreaseBid}
            canIncrease={canIncreaseBid}
            onDecrease={decreaseBidAmount}
            onIncrease={increaseBidAmount}
          />

          {isReady ? (
            <>
              {Number(bidAmount) <= computedMaxBid ? (
                <CustomText
                  type='bodysmall'
                  className={`${isTooLow ? 'text-red-500' : 'text-[#787878]'}`}
                >
                  {isNaN(currentValue)
                    ? bidLang.minBid
                    : `${bidLang.minBid} ${formatter.format(computedMinBid)}`}
                </CustomText>
              ) : (
                <CustomText
                  type='bodysmall'
                  className={'text-red-500'}
                >
                  {bidLang.maxBid} {formatter.format(computedMaxBid)}
                </CustomText>
              )}
            </>
          ) : (
            <View className='h-5' />
          )}
        </View>
      </View>

      <SubmitBidButton
        isPending={isPending}
        bidAmount={bidAmount}
        minBid={computedMinBid}
        maxBid={computedMaxBid}
        bidLang={bidLang}
        onPress={() => {
          sendBid();
        }}
        articleAvailable={articleAvailable}
      />
      <View className='mt-2'>
        <Button
          mode='secondary'
          onPress={() => {
            setAutomaticBidModalVisible(true);
          }}
          disabled={isAutomaticBidPending || !articleAvailable}
          isLoading={isAutomaticBidPending}
        >
          {bidLang.createAutomaticBid}
        </Button>
      </View>
      <AutomaticBidModal
        visible={automaticBidModalVisible}
        onClose={() => setAutomaticBidModalVisible(false)}
        onConfirm={createAutomaticBid}
        title={modalTexts.setTitle}
        description={modalTexts.description}
        extraMessage={modalTexts.extraMessage}
        minAmount={computedMinBid}
      />
      {autoBidsAmount !== undefined && autoBidsAmount > 0 && (
        <CustomText
          type='bodysmall'
          className='text-[#787878]'
        >
          {autoBidsAmount}{' '}
          {autoBidsAmount === 1 ? bidLang.automaticBid : bidLang.automaticBids}
        </CustomText>
      )}
    </View>
  );
}

function SubmitBidButton({
  isPending,
  bidAmount,
  minBid,
  maxBid,
  bidLang,
  onPress,
  articleAvailable,
}: {
  isPending: boolean;
  bidAmount: string;
  minBid: number;
  maxBid: number;
  bidLang: DictionaryTypeBid;
  onPress: () => void;
  articleAvailable: boolean;
}) {
  const numericAmount = Number(bidAmount);

  const disabled =
    isPending ||
    bidAmount === '' ||
    !Number.isSafeInteger(numericAmount) ||
    numericAmount % 10 !== 0 ||
    numericAmount < minBid ||
    numericAmount > maxBid ||
    !articleAvailable;

  return (
    <Button
      mode='primary'
      size='small'
      className='w-full rounded-md py-3'
      disabled={disabled}
      onPress={onPress}
      isLoading={isPending}
    >
      {bidLang.sendBid}
    </Button>
  );
}
