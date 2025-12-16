import React, { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { StreamInfoModal } from '@/components/live-auction/StreamInfoModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveAuctionOverlay } from '@/components/live-auction/LiveAuctionOverlay';

export default function LiveAuctionScreen() {
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser, status } = useGetCurrentUser();
  const { locale } = useTranslation();
  const [streamLoaded, setStreamLoaded] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Validar que existe el auction ID
  if (!id) {
    return (
      <CustomError
        refreshRoute={`/(tabs)/auctions/live/index`}
        customMessage={{
          es: 'No se proporcionó el ID de la subasta',
          en: 'Auction ID was not provided',
        }}
      />
    );
  }

  const auctionId = id;

  // Mostrar loader mientras carga el usuario
  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  // Usar username del usuario, o vacío si no hay o hubo error
  const username = currentUser?.username || '';

  // Construir la URL del stream (usando variable de entorno para desarrollo local)
  const streamBaseUrl = process.env.EXPO_PUBLIC_STREAM_URL;
  const streamUrl = `${streamBaseUrl}/${locale}/stream/${auctionId}?username=${encodeURIComponent(username)}`;

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
    <View className='flex-1'>
      {/* WebView ocupando todo el espacio disponible */}
      <WebView
        source={{ uri: streamUrl }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Propiedades de rendimiento
        androidLayerType='hardware'
        androidHardwareAccelerationDisabled={false}
        mixedContentMode='always'
        cacheEnabled={true}
        cacheMode='LOAD_DEFAULT'
        // Eventos
        onLoad={() => {
          setStreamLoaded(true);
          setStreamError(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[STREAM] WebView error:', nativeEvent);
          setStreamError(true);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[STREAM] HTTP error:', nativeEvent.statusCode);
        }}
        onLoadProgress={({ nativeEvent }) => {
          if (nativeEvent.progress === 1) {
            setStreamLoaded(true);
          }
        }}
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
        onBid={() => {
          console.log('bid');
        }}
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
  );
}
