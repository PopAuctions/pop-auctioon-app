import Toast from 'react-native-toast-message';
import type { Lang, LangMap } from '@/types/types';
import { TOAST_TEXTS, ToastVariant } from '@/providers/ToastProvider';
import { t } from '@/i18n';
import { triggerHaptic } from '@/utils/triggerHaptic';

type ToastPosition = 'top' | 'bottom';

export function useToast(lang: Lang) {
  const callToast = ({
    variant = 'success',
    description,
    position = 'top',
    durationMs,
    haptics = true,
    actionLabel,
    onAction,
  }: {
    variant?: ToastVariant;
    description?: LangMap | string | null;
    position?: ToastPosition;
    durationMs?: number;
    haptics?: boolean;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    if (haptics) {
      const hapticType =
        variant === 'success'
          ? 'success'
          : variant === 'error'
            ? 'error'
            : variant === 'warning'
              ? 'warning' // or 'selection' if you want it softer
              : 'selection'; // info

      triggerHaptic(hapticType, {
        throttleMs: 120,
      });
    }

    // Handle description: can be LangMap, translation key string, or null
    let text2: string | undefined;
    if (description) {
      if (typeof description === 'object' && description !== null) {
        // LangMap object - prioritize this over string
        // Extract the text for current language
        text2 = description[lang];
      } else if (typeof description === 'string') {
        // Translation key string - translate it
        text2 = t(description as any);
      }
    }

    Toast.show({
      type: variant,
      position,
      text1: TOAST_TEXTS[lang][variant],
      text2,
      visibilityTime: durationMs,
      props: { actionLabel, onAction },
    });
  };

  const toast = {
    success: (opts?: Omit<Parameters<typeof callToast>[0], 'variant'>) =>
      callToast({ variant: 'success', ...opts }),
    error: (opts?: Omit<Parameters<typeof callToast>[0], 'variant'>) =>
      callToast({ variant: 'error', ...opts }),
    warning: (opts?: Omit<Parameters<typeof callToast>[0], 'variant'>) =>
      callToast({ variant: 'warning', ...opts }),
    info: (opts?: Omit<Parameters<typeof callToast>[0], 'variant'>) =>
      callToast({ variant: 'info', ...opts }),
    dismiss: () => Toast.hide(),
  };

  return { callToast, toast };
}
