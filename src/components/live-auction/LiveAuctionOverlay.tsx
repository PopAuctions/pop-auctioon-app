import React, { useMemo, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { Chat } from '@/components/chat/Chat';
import { BidSlider } from '@/components/bids/BidSlider';
// import { LiveArticlesContent } from '@/components/live-auction/LiveArticlesContent';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { HalfEllipseArticleWheel } from '@/components/articles/HalfEllipseArticleWheel';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { HighestBidderProvider } from '@/context/highest-bidder-context';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { useAutoHideControls } from '@/hooks/components/useAutoHideControls';
import { REQUEST_STATUS } from '@/constants';
import { LiveCurrentArticleCard } from './LiveCurrentArticleCard';
import { ArticleCountdownUser } from './ArticleCountdownUser';
import { BidSliderSkeleton } from './BidSliderSkeleton';
import { LiveCurrentArticleCardSkeleton } from './LiveCurrentArticleCardSkeleton';
import { LiveCurrentArticleContent } from './LiveCurrentArticleContent';
import { OverlaySheet } from './OverlaySheet';
import { LiveBackButton } from './LiveBackButton';
import {
  BiddingAmounts,
  CustomArticleLiveAuto,
  HighestBidderState,
} from '@/types/types';

interface OverlayProps {
  insetsTop: number;
  insetsBottom: number;
  auctionId: string;
  username: string;
  profilePicture?: string;
  orderedArticles: CustomArticleLiveAuto[];
  biddingAmounts: BiddingAmounts | null;
  articleServerState: HighestBidderState | undefined;
  articleId: number;
  onBack: () => void;
  refetch: (localValue: number) => void;
}

const Z = {
  TAP_CATCHER: 0,
  BID: 10,
  CHAT: 15,
  HUD: 30,
  BACK: 35,
  MODAL_ROOT: 100,
  MODAL_BACKDROP: 110,
  MODAL_CARD: 120,
} as const;

const UI = {
  SCREEN_PADDING: 8,
  HUD_BOTTOM_GAP: 20,
  ROW_GAP: 24,

  BACK_TOP_GAP: 0,
  BACK_SIZE: 30,

  CHAT_WIDTH: 288,
  CHAT_HEIGHT: 180,

  ACTION_GAP: 8,
  ACTION_BTN_SIZE: 48,

  ARTICLE_HUD_HEIGHT: 70,

  BID_HEIGHT: 36,

  KEYBOARD_OFFSET_IOS: 0,
  CHAT_OFFSET: 0,

  TOP_CONTROLS_HEIGHT: 56,
  HUD_TOP_GAP: 0,
  CONTROLS_AUTOHIDE_MS: 2500,
  FADE_MS: 180,
  SLIDE_MS: 180,
} as const;

export const LiveAuctionOverlay = ({
  insetsTop,
  insetsBottom,
  auctionId,
  username,
  profilePicture = '',
  orderedArticles,
  biddingAmounts,
  articleServerState,
  articleId,
  onBack,
  refetch,
}: OverlayProps) => {
  const { t, locale } = useTranslation();
  const deviceType = useDeviceType();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  // const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCurrentArticleModal, setShowCurrentArticleModal] = useState(false);
  // const paused = showInfoModal || showCurrentArticleModal;
  const paused = showCurrentArticleModal;

  const controls = useAutoHideControls({
    fadeMs: UI.FADE_MS,
    slideMs: UI.SLIDE_MS,
    autoHideMs: UI.CONTROLS_AUTOHIDE_MS,
    topControlsHeight: UI.TOP_CONTROLS_HEIGHT,
    paused,
  });
  const controlsOpacity = controls.opacity;

  const currentArticleIndex = useMemo(() => {
    return orderedArticles.findIndex((a) => a.id === articleId);
  }, [orderedArticles, articleId]);
  const currentArticle = useMemo(() => {
    return orderedArticles[currentArticleIndex];
  }, [orderedArticles, currentArticleIndex]);

  // Altura del chat ajustada según el dispositivo
  const chatHeight = deviceType === 'tablet' ? 280 : UI.CHAT_HEIGHT;

  // Bid row pinned
  const bidBottom = insetsBottom + UI.HUD_BOTTOM_GAP;
  const bidAreaHeight = insetsBottom + UI.HUD_BOTTOM_GAP + UI.BID_HEIGHT;

  // Article HUD pinned to top
  const articleHudTop = insetsTop + UI.BACK_TOP_GAP + UI.HUD_TOP_GAP;

  // Chat sits above article HUD
  const chatBottom = UI.ARTICLE_HUD_HEIGHT + UI.ROW_GAP - UI.CHAT_OFFSET;

  const openCurrentArticle = () => {
    controls.hide();
    setShowCurrentArticleModal(true);
  };

  return (
    <>
      <View
        pointerEvents='box-none'
        className='absolute inset-0'
      >
        <Pressable
          onPress={controls.show}
          style={[
            StyleSheet.absoluteFillObject,
            { zIndex: Z.TAP_CATCHER, elevation: 0 },
          ]}
        />

        {/* Back */}
        <LiveBackButton
          onPress={onBack}
          controlsVisible={controls.visible}
          controlsOpacity={controlsOpacity}
          insetsTop={insetsTop}
          UI={UI}
          Z={Z}
        />

        <View
          pointerEvents='box-none'
          style={{
            position: 'absolute',
            right: UI.SCREEN_PADDING - 7,
            bottom: bidBottom + UI.BID_HEIGHT + 70,
            zIndex: Z.HUD,
            elevation: Z.HUD,
            overflow: 'visible',
          }}
        >
          <HalfEllipseArticleWheel
            articles={orderedArticles}
            currentArticleIndex={currentArticleIndex}
            visibleCount={5}
            itemSize={50}
            radiusX={50}
            radiusY={125}
          />
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
            zIndex: Z.CHAT,
            elevation: Z.CHAT,
          }}
        >
          <View
            pointerEvents='box-none'
            className='flex-row items-end justify-between'
          >
            {/* Chat */}
            <View
              pointerEvents='auto'
              style={{ width: UI.CHAT_WIDTH, height: chatHeight }}
            >
              <Chat
                auctionId={auctionId}
                username={username}
                profilePicture={profilePicture}
                enabled
              />
            </View>

            {/* Actions */}
            <View
              pointerEvents='auto'
              style={{ gap: UI.ACTION_GAP, overflow: 'visible' }}
            >
              <ShareButton
                mode='empty'
                className='items-center justify-center'
                lang={locale}
                title={{
                  es: 'Compartir Subasta',
                  en: 'Share Auction',
                }}
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

        <HighestBidderProvider key={articleId}>
          {/* Article HUD */}
          <Animated.View
            onTouchStart={openCurrentArticle}
            pointerEvents='auto'
            style={{
              position: 'absolute',
              left: UI.SCREEN_PADDING,
              right: UI.SCREEN_PADDING,
              top: articleHudTop,
              height: UI.ARTICLE_HUD_HEIGHT,
              transform: [{ translateY: controls.hudOffsetY }],
              zIndex: Z.HUD,
              elevation: Z.HUD,
            }}
          >
            {currentArticle ? (
              <LiveCurrentArticleCard
                article={currentArticle}
                lang={locale}
              />
            ) : (
              <LiveCurrentArticleCardSkeleton height={75} />
            )}
          </Animated.View>

          <View
            pointerEvents='auto'
            style={{
              position: 'absolute',
              left: UI.SCREEN_PADDING,
              right: UI.SCREEN_PADDING,
              bottom: bidBottom,
              height: UI.BID_HEIGHT,
              zIndex: Z.BID,
              elevation: Z.BID,
            }}
          >
            {!isCommissionReady || !biddingAmounts || !articleServerState ? (
              <BidSliderSkeleton height={UI.BID_HEIGHT + 16} />
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
        </HighestBidderProvider>
      </View>

      {/* <OverlaySheet
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        bottomFreeAreaHeight={bidAreaHeight}
        Z={Z}
      >
        <LiveArticlesContent
          articles={orderedArticles}
          currentArticleId={articleId}
          locale={locale}
          commissionValue={commissionData || 0}
          texts={{
            bids: t('screens.liveAuction.bids'),
            estimatedPrice: t('screens.liveAuction.estimatedPrice'),
            liveNow: t('screens.liveAuction.liveNow'),
            articles: t('screens.liveAuction.articles'),
          }}
          onClose={() => setShowInfoModal(false)}
        />
      </OverlaySheet> */}

      <OverlaySheet
        visible={showCurrentArticleModal}
        onClose={() => setShowCurrentArticleModal(false)}
        bottomFreeAreaHeight={bidAreaHeight}
        Z={Z}
      >
        <LiveCurrentArticleContent
          currentArticleId={articleId}
          texts={{ currentArticle: t('screens.liveAuction.currentArticle') }}
          onClose={() => setShowCurrentArticleModal(false)}
        />
      </OverlaySheet>
    </>
  );
};
