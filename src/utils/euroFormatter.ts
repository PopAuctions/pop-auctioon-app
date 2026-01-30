import { Lang } from '@/types/types';

export function euroFormatter(
  lang: Lang,
  digits: number = 0
): Intl.NumberFormat {
  const locale = lang === 'es' ? 'es-ES' : 'en-IE';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
