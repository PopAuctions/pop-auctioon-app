import React from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShareButton } from '@/components/ui/ShareButton';
import { Chat } from '@/components/chat/Chat';
import { BidSlider } from '@/components/bids/BidSlider';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';

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
  SCREEN_PADDING: 16,
  HUD_BOTTOM_GAP: 12,
  ROW_GAP: 12,

  BACK_TOP_GAP: 12,
  BACK_SIZE: 40,

  CHAT_WIDTH: 288,
  CHAT_HEIGHT: 180,

  ACTION_GAP: 8,
  ACTION_BTN_SIZE: 48,

  BID_HEIGHT: 56,
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
  const keyboardVisible = useKeyboardVisible();

  if (!streamLoaded) return null;

  const bottomPadding = keyboardVisible
    ? UI.HUD_BOTTOM_GAP // keep a tiny breathing room
    : insetsBottom + UI.HUD_BOTTOM_GAP;

  return (
    <View
      pointerEvents='box-none'
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
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

      {/* Bottom HUD */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insetsTop : 0}
      >
        <View
          pointerEvents='box-none'
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingHorizontal: UI.SCREEN_PADDING,
            paddingBottom: bottomPadding,
          }}
        >
          {/* Chat + actions */}
          <View
            pointerEvents='box-none'
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: UI.ROW_GAP,
            }}
          >
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

          {/* Bid */}
          <View
            pointerEvents='auto'
            style={{ height: UI.BID_HEIGHT }}
          >
            <BidSlider
              quickBidAmount={300}
              onBid={onBid}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
