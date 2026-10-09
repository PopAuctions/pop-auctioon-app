import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { Lang, LangMap, RefetchReturn, RequestStatus } from '@/types/types';
import { useState } from 'react';
import { createLocalizedMessage } from '@/i18n/api-message';

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
        description: response.success ?? response.data,
      });

      return {
        message: response.success ?? response.data,
      };
    } catch {
      const toastMessage = createLocalizedMessage(
        'errors.account.deleteUnexpected'
      );
      const resultMessage = createLocalizedMessage(
        'errors.account.deleteRetryLater'
      );

      callToast({
        variant: 'error',
        description: toastMessage,
      });
      setStatus(REQUEST_STATUS.error);
      return {
        message: resultMessage,
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
