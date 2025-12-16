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
  /* Brand */
  PRIMARY: '#d75639', // cinnabar

  /* Neutrals */
  BLACK: '#000000',
  WHITE: '#ffffff',

  BORDER: '#cdcdcd',

  /* Derived / usage-specific */
  DRAG_FILL: '#d75639', // same as PRIMARY (no yellow)

  /* Disabled states (same colors, lower opacity) */
  PRIMARY_DISABLED: 'rgba(215, 86, 57, 0.45)', // PRIMARY @ 45%
  THUMB_DISABLED: 'rgba(255, 255, 255, 0.6)', // WHITE @ 60%
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
    ROW_GAP: 12,
    HEIGHT: 56,
    FLEX_CUSTOM: 1,
    FLEX_SLIDER: 2,

    BORDER_RADIUS: 16,
    BORDER_WIDTH: 1,

    SWIPE_THRESHOLD: 85,
  } as const;

  const isDisabled = disabled || isSubmitting;

  const handleBid = async (bidAmount: number) => {
    try {
      setIsSubmitting(true);

      console.log('[BID] Submitting bid of', bidAmount);
      // simulate delay for UX
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await onBid(bidAmount);
    } finally {
      setIsSubmitting(false);

      // 🔄 reset SwipeButton
      setSwipeKey((k) => k + 1);
      console.log('[BID] Bid process finished');
    }
  };

  return (
    <>
      <View style={{ width: '100%', flexDirection: 'row', gap: UI.ROW_GAP }}>
        {/* Left: Custom */}
        <Button
          mode='secondary'
          size='small'
          disabled={isDisabled}
          onPress={() => setCustomOpen(true)}
          className=''
        >
          Custom
        </Button>

        {/* Right: Swipe-to-bid */}
        <View style={{ height: UI.HEIGHT, flex: UI.FLEX_SLIDER }}>
          <SwipeButton
            key={swipeKey}
            disabled={isDisabled}
            height={UI.HEIGHT}
            swipeSuccessThreshold={UI.SWIPE_THRESHOLD}
            title={`Bid: ${quickBidAmount}  >>`}
            onSwipeSuccess={() => handleBid(quickBidAmount)}
            titleFontSize={18}
            titleColor={COLORS.BLACK}
            /* Active */
            railBackgroundColor={COLORS.WHITE}
            railFillBackgroundColor={COLORS.DRAG_FILL}
            railBorderColor={COLORS.PRIMARY}
            railFillBorderColor='transparent'
            thumbIconBackgroundColor={COLORS.WHITE}
            thumbIconBorderColor={COLORS.PRIMARY}
            thumbIconWidth={100}
            /* Disabled */
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

  const UI = {
    OVERLAY_OPACITY: 'rgba(0,0,0,0.5)',
    CARD_RADIUS: 24,
    CARD_PADDING: 20,
    BTN_HEIGHT: 48,
    BTN_RADIUS: 16,
    BTN_GAP: 12,
  } as const;

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
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: UI.OVERLAY_OPACITY }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            marginHorizontal: 20,
            marginTop: 'auto',
            marginBottom: 20,
            borderRadius: UI.CARD_RADIUS,
            backgroundColor: 'white',
            padding: UI.CARD_PADDING,
          }}
        >
          <Text
            style={{
              marginBottom: 8,
              fontSize: 18,
              fontWeight: '800',
              color: '#111',
            }}
          >
            Custom bid
          </Text>

          {showMin ? (
            <Text style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
              Min: {minBid}
            </Text>
          ) : null}

          <Input
            value={value}
            onChangeText={onChangeValue}
            placeholder='...'
            editable={!disabled}
          />

          <View
            style={{ marginTop: 16, flexDirection: 'row', gap: UI.BTN_GAP }}
          >
            <Button
              mode='primary'
              onPress={handleSubmit}
              disabled={disabled}
              style={{
                opacity: disabled ? 0.6 : 1,
              }}
              className='w-1/2'
            >
              Place bid
            </Button>

            <Button
              mode='secondary'
              onPress={onClose}
              disabled={disabled}
              style={{
                opacity: disabled ? 0.6 : 1,
              }}
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
