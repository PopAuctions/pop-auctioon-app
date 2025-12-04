import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { Chat } from '@/components/chat/Chat';
import { Ionicons } from '@expo/vector-icons';

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser, status } = useGetCurrentUser();
  const { locale } = useTranslation();
  const [streamLoaded, setStreamLoaded] = useState(false);
  const [streamError, setStreamError] = useState(false);

  // Validar que existe el auction ID
  if (!id) {
    return (
      <CustomError
        refreshRoute='/(tabs)/auctions'
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

  console.log(
    `Iniciando subasta en vivo: ${auctionId} para el usuario ${username || '(sin usuario)'}`
  );

  // Construir la URL del stream
  const streamUrl = `http://10.0.2.2:3000/es/stream/${auctionId}?username=${username}`;

  // Si el stream falló, mostrar error
  if (streamError) {
    return (
      <CustomError
        refreshRoute='/(tabs)/auctions'
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
        onLoad={() => {
          console.log('[STREAM] WebView cargado exitosamente');
          setStreamLoaded(true);
          setStreamError(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[STREAM] WebView error:', nativeEvent);
          setStreamError(true);
        }}
      />

      {/* Overlay con controles flotantes */}
      <View className='pointer-events-box-none absolute inset-0'>
        {/* Botón de Back - Arriba izquierda */}
        <View className='pointer-events-auto absolute left-4 top-12'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='h-10 w-10 items-center justify-center rounded-full bg-black/50'
            activeOpacity={0.7}
          >
            <Ionicons
              name='arrow-back'
              size={24}
              color='white'
            />
          </TouchableOpacity>
        </View>

        {/* Chat flotante - Lado derecho (solo visible cuando stream carga) */}
        {streamLoaded && (
          <View className='pointer-events-auto absolute bottom-4 left-4 h-[25%] w-72'>
            <Chat
              auctionId={auctionId}
              username={username}
              enabled={true}
            />
          </View>
        )}
      </View>
    </View>
  );
}
