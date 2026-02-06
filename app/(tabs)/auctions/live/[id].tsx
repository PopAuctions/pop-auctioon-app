import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';
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
import { AuctionStatus } from '@/constants/auctions';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { useHideTabs } from '@/hooks/useHidetabs';

const STREAM_BASE_URL = process.env.EXPO_PUBLIC_STREAM_URL;

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useHideTabs();

  const auctionId = id;

  const { auth } = useAuth();
  const { data: currentUser } = useGetCurrentUser();
  const {
    data: liveAuctionData,
    status: auctionRequestStatus,
    errorMessage,
    refetch: refetchLiveAuction,
  } = useGetLiveAuction({
    auctionId: auctionId,
    validateIsLive: true,
  });

  const liveAuction = liveAuctionData?.auction ?? null;
  const articlesOrderKey = (liveAuction?.articlesOrder ?? []).join(',');

  const { data: articles } = useFetchArticlesOrder({
    articlesOrderKey: articlesOrderKey,
    locale: locale,
  });

  // Fetch current article being bid on
  const { data: currentArticle, status: currentArticleStatus } =
    useFetchCurrentArticle({
      articleId: liveAuction?.ArticleBid.articleId || 0,
    });

  const {
    data: biddingAmounts,
    status: biddingAmountsStatus,
    refetch: refetchBiddingAmounts,
  } = useFetchBiddingAmounts({
    articleId: liveAuction?.ArticleBid.articleId || null,
    currentPrice: currentArticle?.ArticleBid.currentValue || null,
    startingPrice: currentArticle?.startingPrice || null,
  });

  const orderedArticles = useMemo(
    () =>
      (liveAuction?.articlesOrder ?? [])
        .map((id) => articles.find((a) => a.id === id))
        .filter(Boolean) as CustomArticleLiveAuto[],
    [liveAuction?.articlesOrder, articles]
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
      setShouldDismiss(true);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/auctions');
      }
      return;
    }

    // Caso 2: Usuario cambió de cuenta
    if (
      wasAuthenticatedRef.current &&
      currentUser?.id &&
      initialUserIdRef.current &&
      currentUser.id !== initialUserIdRef.current
    ) {
      setShouldDismiss(true);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/auctions');
      }
      return;
    }

    // Caso 3: Usuario no autenticado inició sesión
    if (
      wasUnauthenticatedRef.current &&
      auth.state === 'authenticated' &&
      currentUser?.id
    ) {
      setShouldDismiss(true);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
      return;
    }
  }, [auth.state, router, currentUser?.id]);

  // Si se debe desmontar, retornar null
  if (shouldDismiss) {
    return null;
  }

  const invalidAuctionId = !auctionId || isNaN(Number(auctionId));
  const showLoading =
    auctionRequestStatus === REQUEST_STATUS.loading ||
    auctionRequestStatus === REQUEST_STATUS.idle;
  // add currentArticleStatus if needed

  const showError =
    auctionRequestStatus === REQUEST_STATUS.error ||
    currentArticleStatus === REQUEST_STATUS.error ||
    biddingAmountsStatus === REQUEST_STATUS.error ||
    (auctionRequestStatus !== REQUEST_STATUS.loading && !liveAuction);

  const username = currentUser?.username || '';
  const profilePicture = currentUser?.profilePicture || '';
  const streamUrl = `${STREAM_BASE_URL}/${locale}/stream/${auctionId}?username=${encodeURIComponent(
    username
  )}`;

  // Extract highest bidder details (only safe to read when liveAuction exists)
  const highestBidderUsername = liveAuction?.ArticleBid.highestBidderUsername;
  const highestBidderImage = liveAuction?.ArticleBid.highestBidderImage;
  const liveArticleId = liveAuction?.ArticleBid.articleId ?? 0;

  const isCurrentArticleReady =
    currentArticleStatus === REQUEST_STATUS.success &&
    currentArticle?.id === liveArticleId;

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

  if (liveAuctionData?.status === AuctionStatus.FINISHED) {
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
        <SafeAreaView
          className='h-full w-full bg-white'
          edges={[]}
        >
          <View className='flex h-full w-full flex-col items-center justify-center text-center'>
            <CustomText
              type='h3'
              className='text-center'
            >
              {t('screens.liveAuction.finished')}
            </CustomText>
            <CustomText
              type='h3'
              className='text-center text-base'
            >
              {t('screens.liveAuction.thanksForWatching')}
            </CustomText>
            <CustomText
              type='h4'
              className='mt-2 text-center text-base text-cinnabar'
            >
              {t('screens.liveAuction.ifAnyArticleWon')}
            </CustomText>
            <View className='mt-6 flex w-1/2 flex-col gap-4'>
              <CustomLink
                href='/(tabs)/account/articles-won?fromTab=true'
                mode='primary'
                dismissFirst
                replace
              >
                {t('screens.liveAuction.goToArticlesWon')}
              </CustomLink>
              <CustomLink
                href='/(tabs)/home'
                mode='secondary'
                dismissFirst
                replace
              >
                {t('globals.goToHome')}
              </CustomLink>
            </View>
          </View>
        </SafeAreaView>
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
        compareTo={AuctionStatus.FINISHED}
      />
      <CustomToast />
    </>
  );
}
