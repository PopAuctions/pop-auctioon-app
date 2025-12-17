import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import SwipeButton from 'rn-swipe-button';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type BidBarProps = {
  quickBidAmount: number;
  minBid?: number;
  disabled?: boolean;
  onBid: (amount: number) => void | Promise<void>;
};

const COLORS = {
  PRIMARY: '#d75639', // cinnabar
  BLACK: '#000000',
  WHITE: '#ffffff',
  BORDER: '#cdcdcd',
  PRIMARY_DISABLED: 'rgba(215, 86, 57, 0.45)',
  THUMB_DISABLED: 'rgba(255, 255, 255, 0.6)',
} as const;

export const BidSlider = ({
  quickBidAmount,
  minBid,
  disabled = false,
  onBid,
}: BidBarProps) => {
  const [customOpen, setCustomOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [swipeKey, setSwipeKey] = useState(0);

  const UI = {
    HEIGHT: 56,
    SWIPE_THRESHOLD: 85,
    THUMB_WIDTH: 80,
  } as const;

  const isDisabled = disabled || isSubmitting;

  const handleBid = async (bidAmount: number) => {
    try {
      setIsSubmitting(true);
      console.log('[BID] Submitting bid of', bidAmount);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await onBid(bidAmount);
    } finally {
      setIsSubmitting(false);
      setSwipeKey((k) => k + 1);
      console.log('[BID] Bid process finished');
    }
  };

  return (
    <>
      {/* Main row */}
      <View className='w-full flex-row gap-3'>
        {/* Left: Custom */}
        <Button
          mode='secondary'
          size='small'
          disabled={isDisabled}
          onPress={() => setCustomOpen(true)}
          className='flex-1'
        >
          Custom
        </Button>

        {/* Right: Swipe */}
        <View
          className='flex-[2]'
          style={{ height: UI.HEIGHT }}
        >
          <SwipeButton
            key={swipeKey}
            disabled={isDisabled}
            height={UI.HEIGHT}
            swipeSuccessThreshold={UI.SWIPE_THRESHOLD}
            title={`Bid: ${quickBidAmount}  >>`}
            titleStyles={{
              paddingLeft: UI.THUMB_WIDTH,
              textAlign: 'right',
            }}
            onSwipeSuccess={() => handleBid(quickBidAmount)}
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
          />
        </View>
      </View>

      <CustomBidModal
        visible={customOpen}
        minBid={minBid}
        disabled={isDisabled}
        onClose={() => setCustomOpen(false)}
        onSubmit={handleBid}
      />
    </>
  );
};

const CustomBidModal = ({
  visible,
  minBid,
  disabled,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  minBid?: number;
  disabled?: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void | Promise<void>;
}) => {
  const [value, onChangeValue] = useState('');
  const showMin = minBid != null;

  const handleSubmit = async () => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      alert('Please enter a valid number');
      return;
    }
    if (minBid != null && numericValue < minBid) {
      alert(`Bid must be at least ${minBid}`);
      return;
    }

    await onSubmit(numericValue);
    onClose();
    onChangeValue('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        onPress={onClose}
        className='flex-1 bg-black/50'
      >
        {/* Card */}
        <Pressable
          onPress={() => {}}
          className='mx-5 mb-5 mt-auto rounded-3xl bg-white p-5'
        >
          <Text className='mb-2 text-lg font-extrabold text-neutral-900'>
            Custom bid
          </Text>

          {showMin && (
            <Text className='mb-3 text-sm text-neutral-500'>Min: {minBid}</Text>
          )}

          <Input
            value={value}
            onChangeText={onChangeValue}
            placeholder='...'
            editable={!disabled}
          />

          <View className='mt-4 flex-row gap-3'>
            <Button
              mode='primary'
              onPress={handleSubmit}
              disabled={disabled}
              className='w-1/2'
            >
              Place bid
            </Button>

            <Button
              mode='secondary'
              onPress={onClose}
              disabled={disabled}
              className='w-1/2'
            >
              Cancel
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
