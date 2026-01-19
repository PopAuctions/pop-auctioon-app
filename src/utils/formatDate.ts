import { Lang } from '@/types/types';

export function formatDate(dateIso: string, lang: Lang) {
  const dateLang = lang === 'en' ? 'en-US' : 'es-ES';
  return new Date(dateIso).toLocaleDateString(dateLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
