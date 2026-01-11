import { GestureResponderEvent } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Button, ButtonMode } from './Button';
import { useToast } from '@/hooks/useToast';
import { Lang } from '@/types/types';

interface ShareButtonProps {
  children: ReactNode;
  mode: ButtonMode;
  className?: string;
  lang: Lang;
}

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL as string;

export function ShareButton({
  children,
  mode = 'primary',
  className,
  lang,
}: ShareButtonProps) {
  const pathname = usePathname();
  const { callToast } = useToast(lang);

  const copyCurrentPath = async () => {
    try {
      // Generate smart share URL that redirects based on device type
      // Endpoint detects if opened from mobile/browser and redirects accordingly:
      // - Mobile: popauctioonapp:///(tabs)/path (deep link to app)
      // - Browser: https://popauctioon.com/lang/path (web version with locale)
      let path = pathname ?? '';

      // Ensure path includes (tabs) group for proper routing
      if (!path.includes('(tabs)')) {
        path = `/(tabs)${path}`;
      }

      // Send locale as query param for backend to use in web redirect
      const shareUrl = `${baseUrl}/api/share?url=${encodeURIComponent(path)}&locale=${lang}`;
      await Clipboard.setStringAsync(shareUrl);
      callToast({
        variant: 'success',
        description: { es: '¡Enlace copiado!', en: 'Link copied!' },
      });
    } catch (error) {
      console.error('Error copying URL', error);
      callToast({
        variant: 'error',
        description: {
          es: '¡Error al copiar el enlace!',
          en: 'Error copying link!',
        },
      });
    }
  };

  const handlePress = (_e?: GestureResponderEvent) => {
    void copyCurrentPath();
  };

  return (
    <Button
      mode={mode}
      className={className}
      onPress={handlePress}
    >
      {children}
    </Button>
  );
}
