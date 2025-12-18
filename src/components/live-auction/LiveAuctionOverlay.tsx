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
import { BiddingAmounts, HighestBidderState } from '@/types/types';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { REQUEST_STATUS } from '@/constants';

type OverlayProps = {
  insetsTop: number;
  insetsBottom: number;
  locale: string;
  auctionId: string;
  username: string;
  onBack: () => void;
  onOpenInfo: () => void;
  biddingAmounts: BiddingAmounts | null;
  articleServerState: HighestBidderState | null;
  articleId: number;
};

const UI = {
  SCREEN_PADDING: 16,
  HUD_BOTTOM_GAP: 20,
  ROW_GAP: 12,

  BACK_TOP_GAP: 12,
  BACK_SIZE: 40,

  CHAT_WIDTH: 288,
  CHAT_HEIGHT: 180,

  ACTION_GAP: 8,
  ACTION_BTN_SIZE: 48,

  BID_HEIGHT: 36,

  KEYBOARD_OFFSET_IOS: 0,
} as const;

export const LiveAuctionOverlay = ({
  insetsTop,
  insetsBottom,
  locale,
  auctionId,
  username,
  onBack,
  onOpenInfo,
  biddingAmounts,
  articleServerState,
  articleId,
}: OverlayProps) => {
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  // get commission amount

  // Bid row is ALWAYS pinned to safe area bottom (don’t change with keyboard)
  const bidBottom = insetsBottom + UI.HUD_BOTTOM_GAP;

  // Chat row sits ABOVE bid row
  const chatBottom = bidBottom + UI.BID_HEIGHT + UI.ROW_GAP;

  return (
    <View
      pointerEvents='box-none'
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
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

      {/* Chat + Actions (keyboard-aware) */}
      <KeyboardAvoidingView
        pointerEvents='box-none'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? UI.KEYBOARD_OFFSET_IOS : 0
        }
        style={{
          position: 'absolute',
          left: UI.SCREEN_PADDING,
          right: UI.SCREEN_PADDING,
          bottom: chatBottom,
        }}
      >
        <View
          pointerEvents='box-none'
          style={{
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
      </KeyboardAvoidingView>

      {/* Bid (NOT keyboard-aware, pinned) */}
      <View
        pointerEvents='auto'
        style={{
          position: 'absolute',
          left: UI.SCREEN_PADDING,
          right: UI.SCREEN_PADDING,
          bottom: bidBottom,
          height: UI.BID_HEIGHT,
        }}
      >
        {/* loading skeleton */}
        {!isCommissionReady || !biddingAmounts || !articleServerState ? null : (
          <BidSlider
            biddingAmounts={biddingAmounts}
            articleServerState={articleServerState}
            articleId={articleId}
            commissionPercentage={commissionData}
          />
        )}
      </View>
    </View>
  );
};
