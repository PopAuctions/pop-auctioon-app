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

  // Cleanup: detener el stream cuando el componente se desmonte
  useEffect(() => {
    return () => {
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
      mixedContentMode='always'
      cacheEnabled={true}
      cacheMode='LOAD_DEFAULT'
      // Eventos
      onLoad={() => {
        setStreamLoaded(true);
        setStreamError(false);
      }}
      onError={() => {
        setStreamError(true);
      }}
      onLoadProgress={({ nativeEvent }) => {
        if (nativeEvent.progress === 1) {
          setStreamLoaded(true);
        }
      }}
    />
  );
};
