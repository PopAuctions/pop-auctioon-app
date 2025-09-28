import { useState, useTransition } from 'react';
import { changeLocale, getCurrentLocale, t as translate } from '@/i18n';
import { Lang } from '@/types/types';

export const useTranslation = () => {
  const [locale, setLocale] = useState<Lang>(getCurrentLocale());
  const [isPending, startTransition] = useTransition();

  const t = translate;

  const changeLanguage = (newLocale: Lang) => {
    // Cambio inmediato del locale del i18n para que las traducciones estén disponibles
    changeLocale(newLocale);

    // Actualización no urgente del estado para re-renders
    startTransition(() => {
      setLocale(newLocale);
    });
  };

  return {
    t,
    locale,
    changeLanguage,
    isPending, // Exportamos isPending para mostrar loading states
  };
};

export default useTranslation;
