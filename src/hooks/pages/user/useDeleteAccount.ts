import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { Lang, RefetchReturn, RequestStatus } from '@/types/types';
import { useState } from 'react';
import type { MessageKey } from '@/i18n';

const DELETE_ACCOUNT_SUCCESS =
  'account.deletedSuccessfully' as const satisfies MessageKey;
const DELETE_ACCOUNT_FAILED =
  'errors.account.deleteFailed' as const satisfies MessageKey;
const DELETE_ACCOUNT_UNEXPECTED =
  'errors.account.deleteUnexpected' as const satisfies MessageKey;
const DELETE_ACCOUNT_RETRY_LATER =
  'errors.account.deleteRetryLater' as const satisfies MessageKey;
const NETWORK_ERROR = 'errors.server.connection' as const satisfies MessageKey;

export const useDeleteAccount = (
  locale: Lang
): {
  status: RequestStatus;
  deleteAccount: () => RefetchReturn<MessageKey>;
} => {
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const { secureDelete } = useSecureApi();
  const { callToast } = useToast(locale);
  const { forceLogout } = useAuth();

  const deleteAccount = async () => {
    setStatus(REQUEST_STATUS.loading);
    try {
      const response = await secureDelete<unknown>({
        endpoint: SECURE_ENDPOINTS.USER.DELETE_USER,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        const message = response.messageCode ?? NETWORK_ERROR;
        callToast({
          variant: 'error',
          description: message,
        });

        return {
          message,
        };
      }

      setStatus(REQUEST_STATUS.success);
      await forceLogout();

      callToast({
        variant: 'success',
        description: response.messageCode ?? DELETE_ACCOUNT_SUCCESS,
      });

      return {
        message: response.messageCode ?? DELETE_ACCOUNT_SUCCESS,
      };
    } catch {
      callToast({
        variant: 'error',
        description: DELETE_ACCOUNT_UNEXPECTED,
      });
      setStatus(REQUEST_STATUS.error);
      return {
        message: DELETE_ACCOUNT_RETRY_LATER,
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
