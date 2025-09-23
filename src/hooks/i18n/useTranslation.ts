import { useState, useTransition } from 'react';
import i18n, { changeLocale, getCurrentLocale } from '../../i18n/index';

export const useTranslation = () => {
  const [locale, setLocale] = useState(getCurrentLocale());
  const [isPending, startTransition] = useTransition();

  const t = (key: string, options?: any) => {
    return i18n.t(key, options);
  };

  const changeLanguage = (newLocale: 'es' | 'en') => {
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
