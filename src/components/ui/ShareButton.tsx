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
      const fullUrl = `${baseUrl}${pathname ?? ''}`;
      await Clipboard.setStringAsync(fullUrl);
      console.log('Copied URL:', fullUrl);
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
