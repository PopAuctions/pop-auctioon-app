/**
 * Constantes de localización e idiomas
 */
import type { Lang, LocaleLabels, Country } from '@/types/types';

export const LOCALES: LocaleLabels = {
  es: { value: 'es', label: 'Es', ariaLabel: 'Cambiar a español' },
  en: { value: 'en', label: 'En', ariaLabel: 'Change to english' },
} as const;

export const AVAILABLE_COUNTRIES_LANG: Record<Lang, Country[]> = {
  es: [
    { value: 'ES', label: 'España' },
    { value: 'DE', label: 'Alemania' },
  ],
  en: [
    { value: 'ES', label: 'Spain' },
    { value: 'DE', label: 'Germany' },
  ],
};
