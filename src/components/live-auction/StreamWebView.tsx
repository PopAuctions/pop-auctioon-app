import { WebView } from 'react-native-webview';

export const StreamWebView = ({
  streamUrl,
  setStreamLoaded,
  setStreamError,
}: {
  streamUrl: string;
  setStreamLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamError: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <WebView
      source={{ uri: streamUrl }}
      style={{ flex: 1 }}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      startInLoadingState={false}
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
  );
};
