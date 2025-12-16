import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShareButton } from '@/components/ui/ShareButton';
import { Chat } from '@/components/chat/Chat';
import { BidSlider } from '@/components/bids/BidSlider';

type OverlayProps = {
  insetsTop: number;
  insetsBottom: number;
  locale: string;
  streamLoaded: boolean;
  auctionId: string;
  username: string;
  onBack: () => void;
  onOpenInfo: () => void;
  onBid: () => void;
};

const UI = {
  // Spacing
  SCREEN_PADDING: 16, // left-4 / right-4
  HUD_BOTTOM_GAP: 12,
  ROW_GAP: 12,

  // Back button
  BACK_TOP_GAP: 12,
  BACK_SIZE: 40,

  // Action buttons
  ACTION_BTN_SIZE: 48,
  ACTION_GAP: 8,

  // Bid slider
  BID_HEIGHT: 56, // h-14
  BID_RADIUS: 16, // rounded-2xl look

  // Chat sizing
  CHAT_WIDTH: 288, // w-72
  CHAT_HEIGHT: 220, // fijo (recomendado para estabilidad)
} as const;

export const LiveAuctionOverlay = ({
  insetsTop,
  insetsBottom,
  locale,
  streamLoaded,
  auctionId,
  username,
  onBack,
  onOpenInfo,
  onBid,
}: OverlayProps) => {
  if (!streamLoaded) return null;

  // Posiciones calculadas (sin magic numbers)
  const bottomHudY = insetsBottom + UI.HUD_BOTTOM_GAP;

  const bidY = bottomHudY;
  const actionsAndChatY = bidY + UI.BID_HEIGHT + UI.ROW_GAP;

  return (
    <View
      className='absolute inset-0'
      pointerEvents='box-none'
    >
      {/* Back */}
      <View
        pointerEvents='auto'
        style={{
          position: 'absolute',
          left: UI.SCREEN_PADDING,
          top: insetsTop + UI.BACK_TOP_GAP,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{
            height: UI.BACK_SIZE,
            width: UI.BACK_SIZE,
            borderRadius: UI.BACK_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <Ionicons
            name='arrow-back'
            size={24}
            color='white'
          />
        </TouchableOpacity>
      </View>

      {/* Bid slider (bottom row) */}
      <View
        pointerEvents='auto'
        style={{
          position: 'absolute',
          left: UI.SCREEN_PADDING,
          right: UI.SCREEN_PADDING,
          bottom: bidY,
          height: UI.BID_HEIGHT,
        }}
      >
        <BidSlider
          quickBidAmount={300}
          onBid={onBid}
        />
      </View>

      {/* Row above bid: Chat (left) + Actions (right) */}
      <View
        pointerEvents='box-none'
        style={{
          position: 'absolute',
          left: UI.SCREEN_PADDING,
          right: UI.SCREEN_PADDING,
          bottom: actionsAndChatY,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {/* Chat */}
        <View
          pointerEvents='auto'
          style={{
            width: UI.CHAT_WIDTH,
            height: UI.CHAT_HEIGHT,
          }}
        >
          <Chat
            auctionId={auctionId}
            username={username}
            enabled
          />
        </View>

        {/* Actions */}
        <View
          pointerEvents='auto'
          style={{ gap: UI.ACTION_GAP }}
        >
          <TouchableOpacity
            onPress={onOpenInfo}
            activeOpacity={0.7}
            style={{
              height: UI.ACTION_BTN_SIZE,
              width: UI.ACTION_BTN_SIZE,
              borderRadius: UI.ACTION_BTN_SIZE / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <Ionicons
              name='information-circle-outline'
              size={28}
              color='white'
            />
          </TouchableOpacity>

          <ShareButton
            mode='empty'
            className='items-center justify-center'
            lang={locale as any}
          >
            <View
              style={{
                height: UI.ACTION_BTN_SIZE,
                width: UI.ACTION_BTN_SIZE,
                borderRadius: UI.ACTION_BTN_SIZE / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}
            >
              <Ionicons
                name='share-outline'
                size={24}
                color='white'
              />
            </View>
          </ShareButton>
        </View>
      </View>
    </View>
  );
};
