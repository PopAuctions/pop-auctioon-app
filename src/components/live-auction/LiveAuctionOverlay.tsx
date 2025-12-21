import React, { useMemo, useState } from 'react';
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
import { LiveArticlesModal } from '@/components/live-auction/LiveArticlesModal';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { REQUEST_STATUS } from '@/constants';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import {
  BiddingAmounts,
  CustomArticleLiveAuto,
  HighestBidderState,
} from '@/types/types';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { LiveCurrentArticleCard } from './LiveCurrentArticleCard';
import { ArticleCountdownUser } from './ArticleCountdownUser';
import { BidSliderSkeleton } from './BidSliderSkeleton';

type OverlayProps = {
  insetsTop: number;
  insetsBottom: number;
  auctionId: string;
  username: string;
  orderedArticles: CustomArticleLiveAuto[];
  biddingAmounts: BiddingAmounts | null;
  articleServerState: HighestBidderState | null;
  articleId: number;
  onBack: () => void;
  refetch: (localValue: number) => void;
};

const UI = {
  SCREEN_PADDING: 8,
  HUD_BOTTOM_GAP: 20,
  ROW_GAP: 12,

  BACK_TOP_GAP: 12,
  BACK_SIZE: 40,

  CHAT_WIDTH: 288,
  CHAT_HEIGHT: 180,

  ACTION_GAP: 8,
  ACTION_BTN_SIZE: 48,

  ARTICLE_HUD_HEIGHT: 76,

  BID_HEIGHT: 36,

  KEYBOARD_OFFSET_IOS: 0,
} as const;

export const LiveAuctionOverlay = ({
  insetsTop,
  insetsBottom,
  auctionId,
  username,
  orderedArticles,
  biddingAmounts,
  articleServerState,
  articleId,
  onBack,
  refetch,
}: OverlayProps) => {
  const { t, locale } = useTranslation();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  const [showInfoModal, setOpenArticlesModal] = useState(false);

  const currentArticle = useMemo(() => {
    return orderedArticles.find((a) => a.id === articleId) ?? null;
  }, [orderedArticles, articleId]);

  // Bid row pinned
  const bidBottom = insetsBottom + UI.HUD_BOTTOM_GAP;

  // Article HUD sits above bid
  const articleHudBottom = bidBottom + UI.BID_HEIGHT + UI.ROW_GAP;

  // Chat sits above article HUD
  const chatBottom = articleHudBottom + UI.ARTICLE_HUD_HEIGHT + UI.ROW_GAP;

  return (
    <>
      <View
        pointerEvents='box-none'
        className='absolute inset-0'
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
            className='flex-row items-end justify-between'
          >
            {/* Chat */}
            <View
              pointerEvents='auto'
              style={{ width: UI.CHAT_WIDTH, height: UI.CHAT_HEIGHT }}
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
                onPress={() => setOpenArticlesModal(true)}
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
                <FontAwesomeIcon
                  variant='bold'
                  name='list'
                  size={24}
                  color='#FFFFFF'
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
                  <FontAwesomeIcon
                    variant='bold'
                    name='share'
                    size={24}
                    color='#FFFFFF'
                  />
                </View>
              </ShareButton>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Article HUD (not keyboard-aware, fixed slot) */}
        <View
          pointerEvents='auto'
          style={{
            position: 'absolute',
            left: UI.SCREEN_PADDING,
            right: UI.SCREEN_PADDING,
            bottom: articleHudBottom,
            height: UI.ARTICLE_HUD_HEIGHT,
          }}
        >
          {currentArticle ? (
            <LiveCurrentArticleCard
              article={currentArticle}
              lang={locale}
            />
          ) : null}
        </View>

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
          {!isCommissionReady || !biddingAmounts || !articleServerState ? (
            <BidSliderSkeleton height={UI.BID_HEIGHT} />
          ) : (
            <BidSlider
              biddingAmounts={biddingAmounts}
              articleServerState={articleServerState}
              articleId={articleId}
              commissionPercentage={commissionData}
            />
          )}
        </View>

        <ArticleCountdownUser
          articleId={articleId}
          COUNTDOWN_STEPS={10}
          refetch={refetch}
        />
      </View>

      <LiveArticlesModal
        articles={orderedArticles}
        currentArticleId={articleId}
        lang={locale}
        commissionValue={commissionData || 0}
        texts={{
          bids: t('screens.liveAuction.bids'),
          estimatedPrice: t('screens.liveAuction.estimatedPrice'),
          liveNow: t('screens.liveAuction.liveNow'),
          articles: t('screens.liveAuction.articles'),
        }}
        visible={showInfoModal}
        onClose={() => setOpenArticlesModal(false)}
      />
    </>
  );
};
