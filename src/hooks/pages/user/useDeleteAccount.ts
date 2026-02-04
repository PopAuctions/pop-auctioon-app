import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { Lang, LangMap, RefetchReturn, RequestStatus } from '@/types/types';
import { useState } from 'react';

export const useDeleteAccount = (
  locale: Lang
): {
  status: RequestStatus;
  deleteAccount: () => RefetchReturn;
} => {
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const { secureDelete } = useSecureApi();
  const { callToast } = useToast(locale);
  const { forceLogout } = useAuth();

  const deleteAccount = async () => {
    setStatus(REQUEST_STATUS.loading);
    try {
      const response = await secureDelete<LangMap>({
        endpoint: SECURE_ENDPOINTS.USER.DELETE_USER,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        callToast({
          variant: 'error',
          description: response.error,
        });

        return {
          message: response.error,
        };
      }

      setStatus(REQUEST_STATUS.success);
      await forceLogout();

      callToast({
        variant: 'success',
        description: response.data,
      });

      return {
        message: response.data,
      };
    } catch {
      callToast({
        variant: 'error',
        description: {
          en: 'An error occurred while deleting your account.',
          es: 'Ocurrió un error al eliminar su cuenta.',
        },
      });
      setStatus(REQUEST_STATUS.error);
      return {
        message: {
          en: 'Failed to delete account. Please try again later.',
          es: 'No se pudo eliminar la cuenta. Por favor, inténtelo de nuevo más tarde.',
        },
      };
    } finally {
      setStatus(REQUEST_STATUS.idle);
    }
  };

  return {
    status,
    deleteAccount,
  };
};
