import type { Lang } from '@/i18n/locales';
import * as Sentry from '@sentry/react-native';

export type MissingMessageFallback = 'default-locale' | 'generic-error';

type MissingMessageDiagnostic = {
  fallback: MissingMessageFallback;
  key: string;
  locale: Lang;
};

export function reportMissingMessage({
  fallback,
  key,
  locale,
}: MissingMessageDiagnostic): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      `[i18n] Missing message key "${key}" for locale "${locale}"; using ${fallback} fallback.`
    );
  }

  Sentry.captureMessage('Missing i18n message', {
    fingerprint: ['i18n-missing-message', locale, key],
    level: 'warning',
    tags: {
      'i18n.fallback': fallback,
      'i18n.key': key,
      'i18n.locale': locale,
    },
  });
}
