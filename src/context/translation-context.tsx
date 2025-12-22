import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
} from 'react';
import { changeLocale, getCurrentLocale } from '@/i18n';
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

  const changeLanguage = useCallback((newLocale: Lang) => {
    // Cambio inmediato del locale del i18n
    changeLocale(newLocale);

    // Actualización no urgente del estado para re-renders
    startTransition(() => {
      setLocale(newLocale);
    });
  }, []);

  return (
    <TranslationContext.Provider value={{ locale, changeLanguage, isPending }}>
      {children}
    </TranslationContext.Provider>
  );
}
