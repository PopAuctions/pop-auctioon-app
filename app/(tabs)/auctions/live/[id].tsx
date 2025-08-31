import React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/context/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LiveAuctionScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  // Por ahora usamos 'totisama' como fallback, pero idealmente vendría del session
  const username = session?.user?.user_metadata?.username || 'totisama';
  const auctionId = '14'; // Usa el id de los params, o 14 como fallback
  console.log(
    `Iniciando subasta en vivo: ${auctionId} para el usuario ${username}`
  );

  // Construir la URL del stream
  const streamUrl = `http://10.0.2.2:3000/es/stream/${auctionId}?username=${username}`;

  return (
    <View
      className='flex-1 '
      style={{ paddingTop: insets.top }}
    >
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
