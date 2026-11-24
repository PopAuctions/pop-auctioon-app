import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, RequestStatus } from '@/types/types';
import type { AddressSchemaType } from '@/utils/schemas';
import type { MessageKey } from '@/i18n';

const ADDRESS_CREATE_UNEXPECTED_ERROR =
  'errors.address.createUnexpected' as const satisfies MessageKey;

export const useCreateAddress = (): ActionResponse<null, MessageKey> & {
  createAddress: (data: AddressSchemaType) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { securePost } = useSecureApi();

  const createAddress = async (data: AddressSchemaType): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.USER.CREATE_ADDRESS,
        data,
      });

      if (response.error) {
        console.error('ERROR_CREATE_ADDRESS', response.error);
        setStatus('error');
        setErrorMessage(
          response.messageCode ?? ADDRESS_CREATE_UNEXPECTED_ERROR
        );
        return;
      }

      console.log('SUCCESS_CREATE_ADDRESS');
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_CREATE_ADDRESS - Unexpected error');

      console.error('ERROR_CREATE_ADDRESS_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(ADDRESS_CREATE_UNEXPECTED_ERROR);
    }
  };

  return {
    data: null,
    status,
    errorMessage,
    setErrorMessage,
    createAddress,
  };
};
