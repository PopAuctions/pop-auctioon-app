import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser } = useGetCurrentUser();

  const username = currentUser?.username || 'guest';
  const auctionId = id || '14'; // Usa el id de los params, o 14 como fallback
  console.log(
    `Iniciando subasta en vivo: ${auctionId} para el usuario ${username}`
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
