import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveAuctionOverlay } from '@/components/live-auction/LiveAuctionOverlay';
import { HighestBidderProvider } from '@/context/highest-bidder-context';
import { StreamWebView } from '@/components/live-auction/StreamWebView';
import { useGetLiveAuction } from '@/hooks/pages/auction/useGetLiveAuction';
import { useFetchArticlesOrder } from '@/hooks/pages/live/useFetchArticlesOrder';
import { useFetchCurrentArticle } from '@/hooks/pages/live/useFetchCurrentArticle';
import { CustomArticleLiveAuto } from '@/types/types';
import { useFetchBiddingAmounts } from '@/hooks/components/useFetchBiddingAmounts';
import { CustomToast } from '@/providers/ToastProvider';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';
import { LiveAuctionSubscriber } from '@/components/subscribers/LiveAuctionSubscribe';

const STREAM_BASE_URL = process.env.EXPO_PUBLIC_STREAM_URL;

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const auctionId = id;

  const { data: currentUser, status: userStatus } = useGetCurrentUser();
  const {
    data: liveAuctionData,
    status: auctionStatus,
    errorMessage,
    refetch: refetchLiveAuction,
  } = useGetLiveAuction({
    auctionId: auctionId,
    validateIsLive: true,
  });

  const articlesOrderKey = (liveAuctionData?.articlesOrder ?? []).join(',');

  const { data: articles } = useFetchArticlesOrder({
    articlesOrderKey: articlesOrderKey,
    locale: locale,
  });

  // Fetch current article being bid on
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

  const invalidAuctionId = !auctionId || isNaN(Number(auctionId));
  const showLoading =
    userStatus === REQUEST_STATUS.loading ||
    userStatus === REQUEST_STATUS.idle ||
    auctionStatus === REQUEST_STATUS.loading ||
    auctionStatus === REQUEST_STATUS.idle;
  // add currentArticleStatus if needed

  const showError =
    auctionStatus === REQUEST_STATUS.error ||
    currentArticleStatus === REQUEST_STATUS.error ||
    biddingAmountsStatus === REQUEST_STATUS.error ||
    (auctionStatus !== REQUEST_STATUS.loading && !liveAuctionData);

  const username = currentUser?.username || '';
  const streamUrl = `${STREAM_BASE_URL}/${locale}/stream/${auctionId}?username=${encodeURIComponent(
    username
  )}`;

  // Extract highest bidder details (only safe to read when liveAuctionData exists)
  const highestBidderUsername =
    liveAuctionData?.ArticleBid.highestBidderUsername;
  const highestBidderImage = liveAuctionData?.ArticleBid.highestBidderImage;
  const articleId = liveAuctionData?.ArticleBid.articleId ?? 0;

  const showUnifiedLoader = showLoading || !streamLoaded;

  if (invalidAuctionId) {
    return (
      <View
        pointerEvents='auto'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <CustomError
          refreshRoute={`/(tabs)/auctions/live/index`}
          customMessage={{
            es: 'ID de subasta inválido',
            en: 'Invalid auction ID',
          }}
        />
      </View>
    );
  }

  if (showError) {
    return (
      <View
        pointerEvents='auto'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <CustomError
          refreshRoute={`/(tabs)/auctions/live/${auctionId}`}
          customMessage={
            errorMessage ?? {
              es: 'Hubo un error al cargar la información',
              en: 'There was an error loading information',
            }
          }
        />
      </View>
    );
  }

  if (streamError) {
    return (
      <View
        pointerEvents='auto'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <CustomError
          refreshRoute={`/(tabs)/auctions/live/${auctionId}`}
          customMessage={{
            es: 'Error al cargar el stream de la subasta',
            en: 'Error loading auction stream',
          }}
        />
      </View>
    );
  }

  return (
    <>
      <View className='flex-1'>
        <StreamWebView
          streamUrl={streamUrl}
          setStreamLoaded={setStreamLoaded}
          setStreamError={setStreamError}
        />

        <HighestBidderProvider key={currentArticle?.id || 'no-article'}>
          {showUnifiedLoader ? (
            <View
              pointerEvents='auto'
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Loading
                locale={locale}
                customMessage={
                  showLoading
                    ? {
                        es: 'Cargando información de la subasta...',
                        en: 'Loading auction info...',
                      }
                    : {
                        es: 'Cargando stream de la subasta...',
                        en: 'Loading auction stream...',
                      }
                }
              />
            </View>
          ) : (
            <>
              <LiveAuctionOverlay
                orderedArticles={orderedArticles}
                insetsTop={insets.top}
                insetsBottom={insets.bottom}
                auctionId={auctionId}
                username={username}
                onBack={() => router.back()}
                biddingAmounts={biddingAmounts}
                articleServerState={{
                  highestBidder: highestBidderUsername ?? '',
                  highestBidderImage: highestBidderImage ?? null,
                  currentValue: currentArticle?.ArticleBid.currentValue ?? 0,
                  available: currentArticle?.ArticleBid.available ?? false,
                }}
                articleId={articleId}
              />
            </>
          )}
        </HighestBidderProvider>
      </View>

      <LiveAuctionSubscriber
        auctionId={Number(auctionId)}
        refetch={refetchLiveAuction}
      />
      <AuctionSubscriber
        auctionId={Number(auctionId)}
        refetch={refetchLiveAuction}
      />
      <CustomToast />
    </>
  );
}
