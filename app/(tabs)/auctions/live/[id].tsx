import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveAuctionOverlay } from '@/components/live-auction/LiveAuctionOverlay';
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

  const { auth } = useAuth();
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

  const {
    data: biddingAmounts,
    status: biddingAmountsStatus,
    refetch: refetchBiddingAmounts,
  } = useFetchBiddingAmounts({
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
  const [shouldDismiss, setShouldDismiss] = useState(false);

  // Guardar referencia al estado de autenticación inicial
  const wasAuthenticatedRef = useRef(false);
  const wasUnauthenticatedRef = useRef(false);
  const initialUserIdRef = useRef<string | null>(null);

  // Rastrear estado de autenticación inicial
  useEffect(() => {
    // Primera vez que se monta el componente
    if (!wasAuthenticatedRef.current && !wasUnauthenticatedRef.current) {
      if (auth.state === 'authenticated' && currentUser?.id) {
        wasAuthenticatedRef.current = true;
        initialUserIdRef.current = currentUser.id;
      } else if (auth.state === 'unauthenticated') {
        wasUnauthenticatedRef.current = true;
      }
      return;
    }

    // Detectar cambios de estado de autenticación
    // Caso 1: Usuario cerró sesión
    if (wasAuthenticatedRef.current && auth.state === 'unauthenticated') {
      console.log('[LIVE_AUCTION_DEBUG] Usuario cerró sesión, desmontando componente');
      setShouldDismiss(true);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/auctions');
      }
      return;
    }

    // Caso 2: Usuario cambió de cuenta
    if (wasAuthenticatedRef.current && currentUser?.id && initialUserIdRef.current && currentUser.id !== initialUserIdRef.current) {
      console.log('[LIVE_AUCTION_DEBUG] Usuario cambió de cuenta, desmontando componente');
      setShouldDismiss(true);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/auctions');
      }
      return;
    }

    // Caso 3: Usuario no autenticado inició sesión
    if (wasUnauthenticatedRef.current && auth.state === 'authenticated' && currentUser?.id) {
      console.log('[LIVE_AUCTION_DEBUG] Usuario inició sesión, desmontando componente');
      setShouldDismiss(true);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
      return;
    }
  }, [auth.state, currentUser?.id]);

  // Si se debe desmontar, retornar null
  if (shouldDismiss) {
    return null;
  }

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
  const profilePicture = currentUser?.profilePicture || '';
  const streamUrl = `${STREAM_BASE_URL}/${locale}/stream/${auctionId}?username=${encodeURIComponent(
    username
  )}`;

  // Extract highest bidder details (only safe to read when liveAuctionData exists)
  const highestBidderUsername =
    liveAuctionData?.ArticleBid.highestBidderUsername;
  const highestBidderImage = liveAuctionData?.ArticleBid.highestBidderImage;
  const liveArticleId = liveAuctionData?.ArticleBid.articleId ?? 0;

  const isCurrentArticleReady =
    currentArticleStatus === REQUEST_STATUS.success &&
    currentArticle?.id === liveArticleId;

  const showUnifiedLoader = showLoading || !streamLoaded;

  // DEBUG: Log stream URL and loading states
  console.log('[LIVE_AUCTION_DEBUG] =========================');
  console.log('[LIVE_AUCTION_DEBUG] Stream URL:', streamUrl);
  console.log('[LIVE_AUCTION_DEBUG] STREAM_BASE_URL:', STREAM_BASE_URL);
  console.log('[LIVE_AUCTION_DEBUG] Locale:', locale);
  console.log('[LIVE_AUCTION_DEBUG] Auction ID:', auctionId);
  console.log('[LIVE_AUCTION_DEBUG] Username:', username);
  console.log('[LIVE_AUCTION_DEBUG] --------------------------');
  console.log('[LIVE_AUCTION_DEBUG] showLoading:', showLoading);
  console.log('[LIVE_AUCTION_DEBUG] streamLoaded:', streamLoaded);
  console.log('[LIVE_AUCTION_DEBUG] streamError:', streamError);
  console.log('[LIVE_AUCTION_DEBUG] showUnifiedLoader:', showUnifiedLoader);
  console.log('[LIVE_AUCTION_DEBUG] --------------------------');
  console.log('[LIVE_AUCTION_DEBUG] userStatus:', userStatus);
  console.log('[LIVE_AUCTION_DEBUG] auctionStatus:', auctionStatus);
  console.log('[LIVE_AUCTION_DEBUG] currentArticleStatus:', currentArticleStatus);
  console.log('[LIVE_AUCTION_DEBUG] biddingAmountsStatus:', biddingAmountsStatus);
  console.log('[LIVE_AUCTION_DEBUG] liveAuctionData:', !!liveAuctionData);
  console.log('[LIVE_AUCTION_DEBUG] =========================');

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
        {/* Mover dentro del overlay sin incluir el chat para que no se rerenderize cuando cambie el */}
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
          <LiveAuctionOverlay
            orderedArticles={orderedArticles}
            insetsTop={insets.top}
            insetsBottom={insets.bottom}
            auctionId={auctionId}
            username={username}
            profilePicture={profilePicture}
            onBack={() => router.back()}
            biddingAmounts={biddingAmounts}
            articleServerState={
              isCurrentArticleReady
                ? {
                    highestBidder: highestBidderUsername ?? '',
                    highestBidderImage: highestBidderImage ?? null,
                    currentValue: currentArticle?.ArticleBid.currentValue ?? 0,
                    available: currentArticle?.ArticleBid.available ?? false,
                  }
                : undefined
            }
            articleId={liveArticleId}
            refetch={refetchBiddingAmounts}
          />
        )}
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
