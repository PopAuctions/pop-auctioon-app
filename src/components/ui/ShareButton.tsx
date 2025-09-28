import { GestureResponderEvent } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Button, ButtonMode } from './Button';
// import { useToast } from '@/hooks/useToast'; // <-- not used yet (commented)

interface ShareButtonProps {
  children: ReactNode;
  mode: ButtonMode;
  className?: string;
  baseUrl?: string;
}

export function ShareButton({
  children,
  mode = 'primary',
  className,
  baseUrl,
}: ShareButtonProps) {
  const pathname = usePathname();

  // const { callToast } = useToast(lang); // <-- not used yet (commented)

  const copyCurrentPath = async () => {
    try {
      const fullUrl = `${baseUrl}${pathname ?? ''}`;
      await Clipboard.setStringAsync(fullUrl);

      // callToast?.({
      //   variant: 'success',
      //   description: { es: '¡Enlace copiado!', en: 'Link copied!' },
      // });
    } catch {
      // callToast?.({
      //   variant: 'error',
      //   description: {
      //     es: '¡Error al copiar el enlace!',
      //     en: 'Error copying link!',
      //   },
      // });
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
