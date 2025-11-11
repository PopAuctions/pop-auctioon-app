import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import type { Lang, LangMap } from '@/types/types';
import { TOAST_TEXTS, ToastVariant } from '@/providers/ToastProvider';

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
    description?: LangMap | null;
    position?: ToastPosition;
    durationMs?: number;
    haptics?: boolean;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    if (haptics) {
      const type =
        variant === 'success'
          ? Haptics.NotificationFeedbackType.Success
          : variant === 'error'
            ? Haptics.NotificationFeedbackType.Error
            : Haptics.NotificationFeedbackType.Warning;
      Haptics.notificationAsync(type).catch(() => {});
    }

    Toast.show({
      type: variant,
      position,
      text1: TOAST_TEXTS[lang][variant],
      text2: description ? description[lang] : undefined,
      visibilityTime: durationMs,
      // props: { actionLabel, onAction },
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
