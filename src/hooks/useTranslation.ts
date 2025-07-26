import { useState } from 'react';
import i18n, { changeLocale, getCurrentLocale } from '../i18n';

export const useTranslation = () => {
  const [locale, setLocale] = useState(getCurrentLocale());

  const t = (key: string, options?: any) => {
    return i18n.t(key, options);
  };

  const changeLanguage = (newLocale: 'es' | 'en') => {
    changeLocale(newLocale);
    setLocale(newLocale);
  };

  return {
    t,
    locale,
    changeLanguage,
  };
};

export default useTranslation;
