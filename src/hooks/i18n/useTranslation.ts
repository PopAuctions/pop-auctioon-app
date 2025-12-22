import { t as translate } from '@/i18n';
import { useTranslationContext } from '@/context/translation-context';

export const useTranslation = () => {
  const { locale, changeLanguage, isPending } = useTranslationContext();

  const t = translate;

  return {
    t,
    locale,
    changeLanguage,
    isPending,
  };
};
