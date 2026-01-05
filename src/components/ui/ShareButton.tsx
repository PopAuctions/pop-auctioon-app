import { GestureResponderEvent, Platform, Share } from 'react-native';
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
    const fullUrl = `${baseUrl}${pathname ?? ''}`;
    const shareTitle = title?.[lang] ?? text[lang].fallback;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const payload =
        Platform.OS === 'ios'
          ? {
              message: `${shareTitle}\n${fullUrl}`,
              url: fullUrl,
            }
          : {
              message: fullUrl,
              shareTitle,
            };

      await Share.share(payload);
    } catch {
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
