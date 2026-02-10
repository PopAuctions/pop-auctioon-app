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
import { LiveArticlesContent } from '@/components/live-auction/LiveArticlesContent';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
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
import { HighestBidderProvider } from '@/context/highest-bidder-context';
import { LiveCurrentArticleCardSkeleton } from './LiveCurrentArticleCardSkeleton';
import { LiveCurrentArticleContent } from './LiveCurrentArticleContent';
import { OverlaySheet } from './OverlaySheet';

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

const UI = {
  SCREEN_PADDING: 8,
  HUD_BOTTOM_GAP: 20,
  ROW_GAP: 24,

  BACK_TOP_GAP: 12,
  BACK_SIZE: 40,

  CHAT_WIDTH: 288,
  CHAT_HEIGHT: 180,

  ACTION_GAP: 8,
  ACTION_BTN_SIZE: 48,

  ARTICLE_HUD_HEIGHT: 76,

  BID_HEIGHT: 36,

  KEYBOARD_OFFSET_IOS: 0,
  CHAT_OFFSET: 10,
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

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCurrentArticleModal, setShowCurrentArticleModal] = useState(false);

  const currentArticle = useMemo(() => {
    return orderedArticles.find((a) => a.id === articleId) ?? null;
  }, [orderedArticles, articleId]);

  // Altura del chat ajustada según el dispositivo
  const chatHeight = deviceType === 'tablet' ? 280 : UI.CHAT_HEIGHT;

  // Bid row pinned
  const bidBottom = insetsBottom + UI.HUD_BOTTOM_GAP;
  const bidAreaHeight = insetsBottom + UI.HUD_BOTTOM_GAP + UI.BID_HEIGHT + 16;

  // Article HUD sits above bid
  const articleHudBottom = bidBottom + UI.BID_HEIGHT + UI.ROW_GAP;

  // Chat sits above article HUD
  const chatBottom =
    articleHudBottom + UI.ARTICLE_HUD_HEIGHT + UI.ROW_GAP - UI.CHAT_OFFSET;

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
              style={{ gap: UI.ACTION_GAP }}
            >
              <TouchableOpacity
                onPress={() => setShowCurrentArticleModal(true)}
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
                  name='shopping-bag'
                  size={24}
                  color='#FFFFFF'
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowInfoModal(true)}
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
            ) : (
              <LiveCurrentArticleCardSkeleton height={75} />
            )}
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

      <OverlaySheet
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        bottomFreeAreaHeight={bidAreaHeight}
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
      </OverlaySheet>

      <OverlaySheet
        visible={showCurrentArticleModal}
        onClose={() => setShowCurrentArticleModal(false)}
        bottomFreeAreaHeight={bidAreaHeight}
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
