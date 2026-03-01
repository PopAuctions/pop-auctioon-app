import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
  useEffect,
} from 'react';
import {
  changeLocale,
  getCurrentLocale,
  loadLanguagePreference,
  saveLanguagePreference,
  setManualLanguageFlag,
} from '@/i18n';
import { Lang } from '@/types/types';

type TranslationContextType = {
  locale: Lang;
  changeLanguage: (newLocale: Lang) => void;
  /**
   * Syncs the locale from the DB without triggering a DB update.
   * Call this after login when the user's language preference is fetched from the server.
   */
  syncLanguageFromDb: (dbLocale: Lang) => void;
  isPending: boolean;
};

const TranslationContext = createContext<TranslationContextType>({
  locale: 'es',
  changeLanguage: () => {},
  syncLanguageFromDb: () => {},
  isPending: false,
});

export const useTranslationContext = () => useContext(TranslationContext);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Lang>(getCurrentLocale());
  const [isPending, startTransition] = useTransition();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = await loadLanguagePreference();

      if (savedLanguage) {
        // User has a saved preference - use it (priority over system language)
        changeLocale(savedLanguage);
        setLocale(savedLanguage);
      } else {
        // First launch: no saved preference — persist the device language and
        // mark it as a manual choice so LanguageSyncEffect pushes it to the DB
        // on first login instead of the DB's default (es) overriding device lang.
        const deviceLocale = getCurrentLocale();
        saveLanguagePreference(deviceLocale);
        setManualLanguageFlag();
      }

      setIsInitialized(true);
    };

    initializeLanguage();
  }, []);

  const changeLanguage = useCallback((newLocale: Lang) => {
    // Save to AsyncStorage immediately
    saveLanguagePreference(newLocale);

    // Mark that the user explicitly changed the language.
    // LanguageSyncEffect reads this flag on login: if set, local value wins
    // over the DB value instead of being overwritten by it.
    setManualLanguageFlag();

    // Cambio inmediato del locale del i18n
    changeLocale(newLocale);

    // Actualización no urgente del estado para re-renders
    startTransition(() => {
      setLocale(newLocale);
    });
  }, []);

  // Applies a language preference received from the DB without writing back to DB.
  // Also persists locally so next cold-start matches DB value.
  const syncLanguageFromDb = useCallback((dbLocale: Lang) => {
    if (dbLocale === getCurrentLocale()) return;

    saveLanguagePreference(dbLocale);
    changeLocale(dbLocale);

    startTransition(() => {
      setLocale(dbLocale);
    });
  }, []);

  // Don't render children until language is initialized
  // This prevents flash of wrong language
  if (!isInitialized) {
    return null;
  }

  return (
    <TranslationContext.Provider
      value={{ locale, changeLanguage, syncLanguageFromDb, isPending }}
    >
      {children}
    </TranslationContext.Provider>
  );
}
