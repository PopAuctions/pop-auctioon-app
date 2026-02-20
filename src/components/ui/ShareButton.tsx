import { GestureResponderEvent, Keyboard, Platform, Share } from 'react-native';
import { usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Button, ButtonMode } from './Button';
import { useToast } from '@/hooks/useToast';
import { Lang, LangMap } from '@/types/types';
import * as Haptics from 'expo-haptics';

interface ShareButtonProps {
  children: ReactNode;
  mode: ButtonMode;
  className?: string;
  lang: Lang;
  title?: LangMap;
}

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL as string;

const text = {
  es: { fallback: 'Compartir' },
  en: { fallback: 'Share' },
} as const;

export function ShareButton({
  children,
  mode = 'primary',
  className,
  lang,
  title,
}: ShareButtonProps) {
  const pathname = usePathname();
  const { callToast } = useToast(lang);

  const handleShare = async () => {
    try {
      Keyboard.dismiss();
      // Generate smart share URL that redirects based on device type
      let path = pathname ?? '';

      // Ensure path includes (tabs) group for proper routing
      if (!path.includes('(tabs)')) {
        path = `/(tabs)${path}`;
      }

      // Generate smart share URL with locale
      const shareUrl = `${baseUrl}/api/share?url=${encodeURIComponent(path)}&locale=${lang}`;
      const shareTitle = title?.[lang] ?? text[lang].fallback;

      // Add haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Use native share modal (different payloads for iOS vs Android)
      const payload =
        Platform.OS === 'ios'
          ? {
              message: `${shareTitle}\n${shareUrl}`,
              url: shareUrl,
            }
          : {
              message: shareUrl,
              title: shareTitle,
            };

      await Share.share(payload);
    } catch (error) {
      console.error('Error sharing URL', error);
      callToast({
        variant: 'error',
        description: {
          es: 'Hubo un error al compartir',
          en: 'There was an error sharing',
        },
      });
    }
  };

  const handlePress = (_e?: GestureResponderEvent) => {
    void handleShare();
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
