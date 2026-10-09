import { t } from '@/i18n';
import { isLang } from '@/i18n/locales';
import { renderValidationMessage } from '@/i18n/validation-message';

export const getErrorMessage = (
  message: string | undefined,
  locale: string
): string => {
  if (!message || !isLang(locale)) return message ?? '';

  return renderValidationMessage(message, locale, (key, params) =>
    String(t(key, { ...params, locale }))
  );
};
