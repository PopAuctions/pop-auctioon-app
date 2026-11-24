import { LOCALE_CONFIG, type Lang } from '@/i18n/locales';

export function formatDate(dateIso: string, lang: Lang) {
  const dateLang = LOCALE_CONFIG[lang].intlLocale;
  return new Date(dateIso).toLocaleDateString(dateLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
