import { WebView } from 'react-native-webview';
import { useEffect, useRef } from 'react';

export const StreamWebView = ({
  streamUrl,
  setStreamLoaded,
  setStreamError,
}: {
  streamUrl: string;
  setStreamLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamError: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const webViewRef = useRef<WebView>(null);

  console.log('[STREAM_WEBVIEW_DEBUG] StreamWebView mounted');
  console.log('[STREAM_WEBVIEW_DEBUG] Stream URL:', streamUrl);

  // Cleanup: detener el stream cuando el componente se desmonte
  useEffect(() => {
    return () => {
      console.log('[STREAM_WEBVIEW_DEBUG] StreamWebView unmounting - cleaning up');
      // Resetear estados
      setStreamLoaded(false);
      setStreamError(false);
      // El WebView se limpiará automáticamente al desmontarse
    };
  }, [setStreamLoaded, setStreamError]);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: streamUrl }}
      style={{ flex: 1 }}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled={true}
      domStorageEnabled={true}
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
      onLoadStart={() => {
        console.log('[STREAM_WEBVIEW_DEBUG] onLoadStart - WebView started loading');
      }}
      onLoad={() => {
        console.log('[STREAM_WEBVIEW_DEBUG] onLoad - WebView loaded successfully');
        setStreamLoaded(true);
        setStreamError(false);
      }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('[STREAM_WEBVIEW_DEBUG] onError - WebView error:', nativeEvent);
        setStreamError(true);
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('[STREAM_WEBVIEW_DEBUG] onHttpError - HTTP error:', nativeEvent.statusCode, nativeEvent);
      }}
      onLoadProgress={({ nativeEvent }) => {
        console.log('[STREAM_WEBVIEW_DEBUG] onLoadProgress - Progress:', nativeEvent.progress);
        if (nativeEvent.progress === 1) {
          console.log('[STREAM_WEBVIEW_DEBUG] onLoadProgress - Progress reached 100%');
          setStreamLoaded(true);
        }
      }}
      onLoadEnd={() => {
        console.log('[STREAM_WEBVIEW_DEBUG] onLoadEnd - WebView finished loading');
      }}
    />
  );
};
