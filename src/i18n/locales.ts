export const LOCALE_CONFIG = {
  es: {
    label: 'Español',
    shortLabel: 'Es',
    flag: '🇪🇸',
    intlLocale: 'es-ES',
    currencyLocale: 'es-ES',
  },
  en: {
    label: 'English',
    shortLabel: 'En',
    flag: '🇺🇸',
    intlLocale: 'en-US',
    currencyLocale: 'en-IE',
  },
} as const;

export type Lang = keyof typeof LOCALE_CONFIG;

export const SUPPORTED_LANGUAGES = Object.keys(LOCALE_CONFIG) as Lang[];
export const DEFAULT_LANG: Lang = 'es';

export const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES.map((value) => ({
  value,
  label: LOCALE_CONFIG[value].label,
}));

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(LOCALE_CONFIG, value)
  );
}

export function resolveLang(value: unknown): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}
