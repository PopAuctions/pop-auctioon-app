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
} from '@/i18n';
import { Lang } from '@/types/types';

type TranslationContextType = {
  locale: Lang;
  changeLanguage: (newLocale: Lang) => void;
  isPending: boolean;
};

const TranslationContext = createContext<TranslationContextType>({
  locale: 'es',
  changeLanguage: () => {},
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
      }
      // If no saved preference, keep the current locale (from system/default)

      setIsInitialized(true);
    };

    initializeLanguage();
  }, []);

  const changeLanguage = useCallback((newLocale: Lang) => {
    // Save to AsyncStorage immediately
    saveLanguagePreference(newLocale);

    // Cambio inmediato del locale del i18n
    changeLocale(newLocale);

    // Actualización no urgente del estado para re-renders
    startTransition(() => {
      setLocale(newLocale);
    });
  }, []);

  // Don't render children until language is initialized
  // This prevents flash of wrong language
  if (!isInitialized) {
    return null;
  }

  return (
    <TranslationContext.Provider value={{ locale, changeLanguage, isPending }}>
      {children}
    </TranslationContext.Provider>
  );
}
