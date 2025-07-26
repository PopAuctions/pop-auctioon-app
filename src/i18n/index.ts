import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Import translation files
import es from './locales/es.json';
import en from './locales/en.json';

// Set the key-value pairs for the different languages you want to support.
const translations = {
  es,
  en,
};

// Create the i18n instance
const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
// Get the device language, fallback to Spanish (default)
const deviceLanguage = getLocales()[0]?.languageCode ?? 'es';

// Set Spanish as default if the device language is not supported
if (deviceLanguage !== 'en' && deviceLanguage !== 'es') {
  i18n.locale = 'es';
} else {
  i18n.locale = deviceLanguage;
}

// When a value is missing from a language it'll fall back to Spanish (default language)
i18n.enableFallback = true;
i18n.defaultLocale = 'es';

export default i18n;

// Helper function to get current locale
export const getCurrentLocale = () => i18n.locale;

// Helper function to change locale
export const changeLocale = (locale: 'es' | 'en') => {
  i18n.locale = locale;
};

// Helper function to get available locales
export const getAvailableLocales = () => ['es', 'en'];
