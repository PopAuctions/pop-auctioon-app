import { LOCALE_CONFIG, type Lang } from '@/i18n/locales';

export function euroFormatter(
  lang: Lang,
  digits: number = 0
): Intl.NumberFormat {
  return new Intl.NumberFormat(LOCALE_CONFIG[lang].currencyLocale, {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
