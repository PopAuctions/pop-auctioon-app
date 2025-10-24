import { Lang } from '@/types/types';

export function euroFormatter(
  lang: Lang,
  digits: number = 0
): Intl.NumberFormat {
  return new Intl.NumberFormat(`${lang}-EU`, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
