import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { Lang } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_STORAGE_KEY } from '@/constants/locales';

// Import translation files
import es from './locales/es.json';
import en from './locales/en.json';
import { Path, PathValue } from '@/types/i18n';

export type Translations = {
  es: typeof es;
  en: typeof en;
};

export type Dictionary = Translations['es'];

// Set the key-value pairs for the different languages you want to support.
const translations = {
  es,
  en,
} as const satisfies Translations;

// Create the i18n instance
const i18n = new I18n(translations);

// Helper function to get initial locale with priority:
// 1. User's saved preference (AsyncStorage)
// 2. Device language (if supported)
// 3. Default to Spanish
const getInitialLocale = (): Lang => {
  // This will be updated asynchronously, but we need a sync default
  const deviceLanguage = getLocales()[0]?.languageCode ?? 'es';

  // Return device language if supported, otherwise default to Spanish
  if (deviceLanguage === 'en' || deviceLanguage === 'es') {
    return deviceLanguage as Lang;
  }
  return 'es';
};

// Set initial locale (will be updated by TranslationProvider if user has saved preference)
i18n.locale = getInitialLocale();

// When a value is missing from a language it'll fall back to Spanish (default language)
i18n.enableFallback = true;
i18n.defaultLocale = 'es';

export default i18n;

// Helper function to get current locale
export const getCurrentLocale = () => i18n.locale as Lang;

// Helper function to save language preference to AsyncStorage
export const saveLanguagePreference = async (locale: Lang): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Helper function to load language preference from AsyncStorage
export const loadLanguagePreference = async (): Promise<Lang | null> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'es' || savedLanguage === 'en') {
      return savedLanguage as Lang;
    }
    return null;
  } catch (error) {
    console.error('Error loading language preference:', error);
    return null;
  }
};

// Helper function to change locale
export const changeLocale = (locale: Lang) => {
  i18n.locale = locale;
};

// Helper function to get available locales
export const getAvailableLocales = (): Lang[] => ['es', 'en'];

export function t<K extends Path<Dictionary>>(
  key: K,
  options?: any
): PathValue<Dictionary, K> {
  return i18n.t(key as string, options) as PathValue<Dictionary, K>;
}
