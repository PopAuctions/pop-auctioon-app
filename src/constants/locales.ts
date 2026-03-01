/**
 * Constantes de localización e idiomas
 */
import type { Lang, LocaleLabels, Country } from '@/types/types';

// AsyncStorage key for user's language preference
export const LANGUAGE_STORAGE_KEY = '@app_language';

/**
 * Flag set when the user explicitly changes language while unauthenticated.
 * On login, if this flag is set the local value is pushed to the DB instead
 * of being overwritten by the DB value.
 */
export const LANGUAGE_MANUALLY_SET_KEY = '@app_language_manually_set';

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
