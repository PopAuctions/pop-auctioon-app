import Toast from 'react-native-toast-message';
import type { Lang, LangMap } from '@/types/types';
import { type ToastVariant } from '@/providers/ToastProvider';
import { t } from '@/i18n';
import type { MessageKey } from '@/i18n';
import { triggerHaptic } from '@/utils/triggerHaptic';

type ToastPosition = 'top' | 'bottom';
type ToastMessageParams = Record<string, string | number | boolean>;

export type ToastErrorCode = MessageKey;

export type ToastMessageDescriptor = {
  code: ToastErrorCode;
  params?: ToastMessageParams;
};

/** @deprecated Remove after legacy mobile API responses use error codes. */
export type LegacyToastDescription = LangMap;

export type ToastDescription =
  string | ToastMessageDescriptor | LegacyToastDescription;

const TOAST_TITLE_KEYS = {
  success: 'common.toast.success',
  error: 'common.toast.error',
  warning: 'common.toast.warning',
  info: 'common.toast.info',
} as const satisfies Record<ToastVariant, string>;

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
    description?: ToastDescription | null;
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

    // New callers use a translated string/key or an error descriptor. Legacy
    // bilingual API responses stay supported until the API migration finishes.
    let text2: string | undefined;
    if (description) {
      if (typeof description === 'string') {
        // Translation key string - translate it
        text2 = t(description as any, { locale: lang });
      } else if ('code' in description) {
        text2 = t(description.code, {
          ...description.params,
          locale: lang,
        });
      } else {
        // Temporary adapter for legacy bilingual API responses.
        text2 = description[lang];
      }
    }

    Toast.show({
      type: variant,
      position,
      text1: t(TOAST_TITLE_KEYS[variant], { locale: lang }),
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
