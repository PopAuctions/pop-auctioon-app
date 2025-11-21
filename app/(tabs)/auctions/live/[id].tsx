import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser, status } = useGetCurrentUser();
  const { locale } = useTranslation();

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

  return (
    <View className='flex-1 '>
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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
}
