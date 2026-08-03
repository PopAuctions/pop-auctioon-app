import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  View,
} from 'react-native';
import SwipeButton from 'rn-swipe-button';
import { Button } from '../ui/Button';
import { useSendBid } from '@/hooks/components/useSendBid';
import { BiddingAmounts, HighestBidderState } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { toTotal } from '@/utils/toTotal';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { hapticImpact } from '@/utils/triggerHaptic';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';
import { ceilToNearestTen } from '@/utils/ceilToNearestTen';
import { BidAmountStepper } from './BidAmountStepper';

type BidSliderProps = {
  biddingAmounts: BiddingAmounts;
  articleServerState: HighestBidderState;
  articleId: number;
  commissionPercentage: number;
};

const COLORS = {
  PRIMARY: '#d75639', // cinnabar
  BLACK: '#000000',
  WHITE: '#ffffff',
  BORDER: '#cdcdcd',
  PRIMARY_DISABLED: 'rgba(215, 86, 57, 0.45)',
  THUMB_DISABLED: 'rgba(255, 255, 255, 0.6)',
} as const;

const UI = {
  HEIGHT: 56,
  SWIPE_THRESHOLD: 85,
  THUMB_WIDTH: 80,
} as const;

export const BidSlider = ({
  biddingAmounts,
  articleServerState,
  articleId,
  commissionPercentage,
}: BidSliderProps) => {
  const { t } = useTranslation();
  const {
    currentValue,
    isPending,
    computedMaxBid,
    computedMinBid,
    bidAmount,
    tenPercent,
    articleAvailable,
    canDecreaseBid,
    canIncreaseBid,
    decreaseBidAmount,
    increaseBidAmount,
    sendBid,
    formatter,
  } = useSendBid({
    biddingAmounts,
    articleServerState,
    articleId,
    commissionPercentage,
  });

  const [customOpen, setCustomOpen] = useState(false);
  const [swipeKey, setSwipeKey] = useState(0);

  const slideAmount = useMemo(
    () =>
      ceilToNearestTen(
        toTotal(tenPercent + currentValue, commissionPercentage)
      ),
    [tenPercent, currentValue, commissionPercentage]
  );

  const isDisabled = isPending || !articleAvailable;

  const renderThumb = useCallback(
    () => (
      <SwipeThumb
        loading={isPending}
        articleAvailable={articleAvailable}
      />
    ),
    [isPending, articleAvailable]
  );

  const handleBid = async () => {
    hapticImpact();

    await sendBid(slideAmount);

    requestAnimationFrame(() => {
      setSwipeKey((key) => key + 1);
    });
  };

  return (
    <>
      <View className='w-full flex-row items-center justify-start gap-3'>
        <Button
          mode='secondary'
          size='small'
          disabled={isDisabled}
          onPress={() => {
            Keyboard.dismiss();
            setCustomOpen(true);
          }}
          className='h-full flex-1'
          textClassName='text-center'
        >
          {t('screens.liveAuction.customBid')}
        </Button>

        <View
          className='my-auto h-full flex-[2]'
          style={{ maxHeight: UI.HEIGHT }}
        >
          <SwipeButton
            key={swipeKey}
            disabled={isDisabled}
            swipeSuccessThreshold={UI.SWIPE_THRESHOLD}
            title={`${t('screens.liveAuction.bids')}: ${formatter.format(
              slideAmount
            )}`}
            titleMaxLines={2}
            titleStyles={{
              paddingLeft: UI.THUMB_WIDTH,
              textAlign: 'center',
              color: isDisabled ? COLORS.BLACK : COLORS.PRIMARY,
            }}
            onSwipeSuccess={handleBid}
            titleFontSize={18}
            titleColor={COLORS.BLACK}
            railBackgroundColor={COLORS.WHITE}
            railFillBackgroundColor={COLORS.PRIMARY}
            railBorderColor={COLORS.PRIMARY}
            railFillBorderColor='transparent'
            thumbIconBackgroundColor={COLORS.WHITE}
            thumbIconBorderColor={COLORS.PRIMARY}
            thumbIconWidth={UI.THUMB_WIDTH}
            disabledThumbIconBackgroundColor={COLORS.THUMB_DISABLED}
            disabledThumbIconBorderColor={COLORS.PRIMARY}
            thumbIconComponent={renderThumb}
          />
        </View>
      </View>

      <CustomBidModal
        visible={customOpen}
        disabled={isDisabled}
        onClose={() => setCustomOpen(false)}
        onSubmit={sendBid}
        bidAmount={bidAmount}
        computedMinBid={computedMinBid}
        computedMaxBid={computedMaxBid}
        canDecreaseBid={canDecreaseBid}
        canIncreaseBid={canIncreaseBid}
        decreaseBidAmount={decreaseBidAmount}
        increaseBidAmount={increaseBidAmount}
        formatter={formatter}
        texts={{
          title: t('screens.liveAuction.customBid'),
          placeBid: t('screens.liveAuction.placeBid'),
          cancel: t('screens.liveAuction.cancel'),
        }}
      />
    </>
  );
};

const SwipeThumb = ({
  loading,
  articleAvailable,
}: {
  loading: boolean;
  articleAvailable: boolean;
}) => {
  return (
    <View
      className={`h-full w-full items-center justify-center bg-transparent`}
      style={{ borderRadius: 9999 }}
    >
      {loading ? (
        <ActivityIndicator
          size='small'
          color={COLORS.PRIMARY}
        />
      ) : articleAvailable ? (
        <FontAwesomeIcon
          name='angle-double-right'
          size={24}
          color='cinnabar'
        />
      ) : (
        <FontAwesomeIcon
          variant='bold'
          name='ban'
          size={24}
          color='cinnabar'
        />
      )}
    </View>
  );
};

const CustomBidModal = ({
  visible,
  disabled = false,
  onClose,
  onSubmit,
  bidAmount,
  computedMinBid,
  computedMaxBid,
  canDecreaseBid,
  canIncreaseBid,
  decreaseBidAmount,
  increaseBidAmount,
  formatter,
  texts,
}: {
  visible: boolean;
  disabled?: boolean;
  bidAmount: string;
  computedMinBid: number;
  computedMaxBid: number;
  canDecreaseBid: boolean;
  canIncreaseBid: boolean;
  decreaseBidAmount: () => void;
  increaseBidAmount: () => void;
  formatter: Intl.NumberFormat;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  texts: {
    title: string;
    placeBid: string;
    cancel: string;
  };
}) => {
  const numericBidAmount = bidAmount === '' ? null : Number(bidAmount);

  const isLow = numericBidAmount !== null && numericBidAmount < computedMinBid;

  const isHigh = numericBidAmount !== null && numericBidAmount > computedMaxBid;

  const isInvalid =
    numericBidAmount === null ||
    !Number.isSafeInteger(numericBidAmount) ||
    numericBidAmount % 10 !== 0;

  const disabledFinal = disabled || isInvalid || isLow || isHigh;

  const handleSubmit = async () => {
    await onSubmit();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className='flex-1 bg-black/50'
      >
        <View className='flex-1 justify-end'>
          <Pressable
            onPress={() => {}}
            className='mx-5 mb-5 mt-auto rounded-3xl bg-white p-5'
          >
            <CustomText type='subtitle'>{texts.title}</CustomText>

            <BidAmountStepper
              value={bidAmount}
              placeholder='...'
              disabled={disabled}
              canDecrease={canDecreaseBid}
              canIncrease={canIncreaseBid}
              onDecrease={decreaseBidAmount}
              onIncrease={increaseBidAmount}
            />

            {isHigh ? (
              <CustomText
                type='bodysmall'
                className='text-sm text-red-500'
              >
                Max: {formatter.format(computedMaxBid)}
              </CustomText>
            ) : (
              <CustomText
                type='bodysmall'
                className={`text-sm ${
                  isLow ? 'text-red-500' : 'text-neutral-500'
                }`}
              >
                Min: {formatter.format(computedMinBid)}
              </CustomText>
            )}

            <View className='mt-4 flex-row gap-3'>
              <Button
                mode='primary'
                onPress={handleSubmit}
                disabled={disabledFinal}
                className='w-1/2'
              >
                {texts.placeBid}
              </Button>

              <Button
                mode='secondary'
                onPress={onClose}
                disabled={disabled}
                className='w-1/2'
              >
                {texts.cancel}
              </Button>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
