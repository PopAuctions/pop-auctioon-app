import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { Lang, RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';
import { useState } from 'react';

const LANGUAGE_UPDATE_ERROR =
  'errors.user.languageUpdateFailed' as const satisfies MessageKey;

/**
 * Hook para actualizar el idioma preferido del usuario en la BD.
 *
 * @param locale - Idioma actual para mostrar mensajes de toast
 *
 * @example
 * ```tsx
 * const { updateLanguage, status } = useUpdateLanguage(locale);
 *
 * // Al guardar configuración
 * await updateLanguage('en');
 * ```
 */
export const useUpdateLanguage = (
  locale: Lang
): {
  status: RequestStatus;
  updateLanguage: (newLanguage: Lang) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const { securePatch } = useSecureApi();
  const { callToast } = useToast(locale);

  const updateLanguage = async (newLanguage: Lang): Promise<void> => {
    setStatus(REQUEST_STATUS.loading);

    try {
      const response = await securePatch<{ success: boolean }>({
        endpoint: SECURE_ENDPOINTS.USER.UPDATE_LANGUAGE,
        data: { language: newLanguage },
      });

      if (response.error) {
        console.error('ERROR_UPDATE_LANGUAGE', response.error);
        callToast({
          variant: 'error',
          description: response.error,
        });
        setStatus(REQUEST_STATUS.error);
        return;
      }

      setStatus(REQUEST_STATUS.success);
    } catch (error) {
      console.error('ERROR_UPDATE_LANGUAGE_CATCH', error);
      callToast({
        variant: 'error',
        description: LANGUAGE_UPDATE_ERROR,
      });
      setStatus(REQUEST_STATUS.error);
    } finally {
      setStatus(REQUEST_STATUS.idle);
    }
  };

  return {
    status,
    updateLanguage,
  };
};
