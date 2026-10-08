import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_MANUALLY_SET_KEY,
} from '@/constants/locales';

// Import translation files
import es from './locales/es.json';
import en from './locales/en.json';
import { Path, PathValue, StringPath } from '@/types/i18n';
import {
  DEFAULT_LANG,
  SUPPORTED_LANGUAGES,
  isLang,
  resolveLang,
  type Lang,
} from './locales';
import { reportMissingMessage } from './report-missing-message';
import type { DisplayLabelDictionary } from './display-labels';

// Set the key-value pairs for the different languages you want to support.
const translations = {
  es,
  en,
} as const satisfies Record<Lang, { displayLabels: DisplayLabelDictionary }>;

export type Translations = typeof translations;
export type Dictionary = Translations[typeof DEFAULT_LANG];
export type MessageKey = StringPath<Dictionary>;

// Create the i18n instance
const i18n = new I18n(translations);

// Helper function to get initial locale with priority:
// 1. User's saved preference (AsyncStorage)
// 2. Device language (if supported)
// 3. Default to Spanish
const getInitialLocale = (): Lang => {
  // This will be updated asynchronously, but we need a sync default
  const deviceLanguage = getLocales()[0]?.languageCode;

  // Return device language if supported, otherwise default to Spanish
  return resolveLang(deviceLanguage);
};

// Set initial locale (will be updated by TranslationProvider if user has saved preference)
i18n.locale = getInitialLocale();

// When a value is missing from a language it'll fall back to Spanish (default language)
i18n.enableFallback = true;
i18n.defaultLocale = DEFAULT_LANG;

export default i18n;

// Helper function to get current locale
export const getCurrentLocale = (): Lang => resolveLang(i18n.locale);

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
    return isLang(savedLanguage) ? savedLanguage : null;
  } catch (error) {
    console.error('Error loading language preference:', error);
    return null;
  }
};

// Helper function to change locale
export const changeLocale = (locale: Lang) => {
  i18n.locale = locale;
};

// ---------------------------------------------------------------------------
// Manual-change flag — persists across restarts so the correct value wins
// when the user changes language while logged out and then logs in.
// An in-memory mirror is kept so callers that don't await the write
// (e.g. fire-and-forget during init) can still read the flag synchronously.
// ---------------------------------------------------------------------------

let _manualLanguageFlagInMemory = false;

export const setManualLanguageFlag = async (): Promise<void> => {
  _manualLanguageFlagInMemory = true; // set synchronously to avoid read races
  try {
    await AsyncStorage.setItem(LANGUAGE_MANUALLY_SET_KEY, 'true');
  } catch (error) {
    console.error('Error setting manual language flag:', error);
  }
};

export const clearManualLanguageFlag = async (): Promise<void> => {
  _manualLanguageFlagInMemory = false; // clear synchronously
  try {
    await AsyncStorage.removeItem(LANGUAGE_MANUALLY_SET_KEY);
  } catch (error) {
    console.error('Error clearing manual language flag:', error);
  }
};

export const getManualLanguageFlag = async (): Promise<boolean> => {
  if (_manualLanguageFlagInMemory) return true; // fast path, avoids AsyncStorage race
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_MANUALLY_SET_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading manual language flag:', error);
    return false;
  }
};

// Helper function to get available locales
export const getAvailableLocales = (): Lang[] => [...SUPPORTED_LANGUAGES];

function getTranslationValue(dictionary: object, key: string): unknown {
  let value: unknown = dictionary;

  for (const segment of key.split('.')) {
    if (
      !segment ||
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value) ||
      !Object.prototype.hasOwnProperty.call(value, segment)
    ) {
      return undefined;
    }

    value = (value as Record<string, unknown>)[segment];
  }

  return value;
}

export function t<K extends Path<Dictionary>>(
  key: K,
  options?: any
): PathValue<Dictionary, K> {
  const keyString = key as string;
  const locale = resolveLang(options?.locale ?? i18n.locale);
  const requestedValue = getTranslationValue(translations[locale], keyString);

  if (requestedValue === undefined || requestedValue === null) {
    const defaultValue = getTranslationValue(
      translations[DEFAULT_LANG],
      keyString
    );
    const fallback =
      locale !== DEFAULT_LANG &&
      defaultValue !== undefined &&
      defaultValue !== null
        ? 'default-locale'
        : 'generic-error';

    reportMissingMessage({ fallback, key: keyString, locale });

    if (fallback === 'generic-error') {
      return translations[locale].errors.unexpected as PathValue<Dictionary, K>;
    }
  }

  return i18n.t(key as string, options) as PathValue<Dictionary, K>;
}
