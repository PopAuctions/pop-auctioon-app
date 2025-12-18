import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { StreamInfoModal } from '@/components/live-auction/StreamInfoModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveAuctionOverlay } from '@/components/live-auction/LiveAuctionOverlay';
import { HighestBidderProvider } from '@/context/highest-bidder-context';
import { StreamWebView } from '@/components/live-auction/StreamWebView';
import { useGetLiveAuction } from '@/hooks/pages/auction/useGetLiveAuction';
import { useFetchArticlesOrder } from '@/hooks/pages/live/useFetchArticlesOrder';
import { useFetchCurrentArticle } from '@/hooks/pages/live/useFetchCurrentArticle';
import { CustomArticleLiveAuto } from '@/types/types';
import { useFetchBiddingAmounts } from '@/hooks/components/useFetchBiddingAmounts';

const STREAM_BASE_URL = process.env.EXPO_PUBLIC_STREAM_URL;

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const auctionId = id;

  const { data: currentUser, status: userStatus } = useGetCurrentUser();
  const { data: liveAuctionData, status: auctionStatus } = useGetLiveAuction({
    auctionId: auctionId,
    validateIsLive: true,
  });

  const articlesOrderKey = (liveAuctionData?.articlesOrder ?? []).join(',');

  const { data: articles } = useFetchArticlesOrder({
    articlesOrderKey: articlesOrderKey,
    locale: locale,
  });
  const { data: currentArticle, status: currentArticleStatus } =
    useFetchCurrentArticle({
      articleId: liveAuctionData?.ArticleBid.articleId || 0,
    });
  const { data: biddingAmounts, status: biddingAmountsStatus } =
    useFetchBiddingAmounts({
      articleId: liveAuctionData?.ArticleBid.articleId || null,
      currentPrice: currentArticle?.ArticleBid.currentValue || null,
      startingPrice: currentArticle?.startingPrice || null,
    });

  const orderedArticles = useMemo(
    () =>
      (liveAuctionData?.articlesOrder ?? [])
        .map((id) => articles.find((a) => a.id === id))
        .filter(Boolean) as CustomArticleLiveAuto[],
    [liveAuctionData?.articlesOrder, articles]
  );

  const [streamLoaded, setStreamLoaded] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Validar que existe el auction ID
  if (!auctionId || isNaN(Number(auctionId))) {
    return (
      <CustomError
        refreshRoute={`/(tabs)/auctions/live/index`}
        customMessage={{
          es: 'ID de subasta inválido',
          en: 'Invalid auction ID',
        }}
      />
    );
  }

  if (
    userStatus === REQUEST_STATUS.loading ||
    userStatus === REQUEST_STATUS.idle ||
    auctionStatus === REQUEST_STATUS.loading ||
    auctionStatus === REQUEST_STATUS.idle
    // add currentArticleStatus if needed
  ) {
    return <Loading locale={locale} />;
  }

  if (
    userStatus === REQUEST_STATUS.error ||
    auctionStatus === REQUEST_STATUS.error ||
    currentArticleStatus === REQUEST_STATUS.error ||
    biddingAmountsStatus === REQUEST_STATUS.error ||
    !liveAuctionData
  ) {
    return (
      <CustomError
        refreshRoute={`/(tabs)/auctions/live/${auctionId}`}
        customMessage={{
          es: 'Hubo un error al cargar la información',
          en: 'There was an error loading information',
        }}
      />
    );
  }

  const auction = liveAuctionData.Auction;
  const currentArticleBidId = liveAuctionData.currentArticleBidId;
  const articleId = liveAuctionData.ArticleBid.articleId;

  const username = currentUser?.username || '';
  const streamUrl = `${STREAM_BASE_URL}/${locale}/stream/${auctionId}?username=${encodeURIComponent(username)}`;

  // Extract highest bidder details
  const highestBidderUsername =
    liveAuctionData.ArticleBid.highestBidderUsername;
  const highestBidderImage = liveAuctionData.ArticleBid.highestBidderImage;

  // Si el stream falló, mostrar error
  if (streamError) {
    return (
      <CustomError
        refreshRoute={`/(tabs)/auctions/live/${auctionId}`}
        customMessage={{
          es: 'Error al cargar el stream de la subasta',
          en: 'Error loading auction stream',
        }}
      />
    );
  }

  return (
    <HighestBidderProvider>
      <View className='flex-1'>
        {/* WebView ocupando todo el espacio disponible */}
        <StreamWebView
          streamUrl={streamUrl}
          setStreamLoaded={setStreamLoaded}
          setStreamError={setStreamError}
        />

        {/* Overlay con controles flotantes */}
        <LiveAuctionOverlay
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          locale={locale}
          streamLoaded={streamLoaded}
          auctionId={auctionId}
          username={username}
          onBack={() => router.back()}
          onOpenInfo={() => setShowInfoModal(true)}
          biddingAmounts={biddingAmounts}
          articleServerState={{
            highestBidder: highestBidderUsername,
            highestBidderImage: highestBidderImage,
            currentValue: currentArticle?.ArticleBid.currentValue ?? 0,
            available: currentArticle?.ArticleBid.available ?? false,
          }}
          articleId={articleId}
        />

        {/* Modal de Stream Info */}
        <StreamInfoModal
          visible={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          auctionId={auctionId}
          username={username}
          streamUrl={streamUrl}
        />
      </View>
    </HighestBidderProvider>
  );
}
