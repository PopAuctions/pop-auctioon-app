import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, RequestStatus, UserAddress } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ADDRESSES_LOAD_ERROR =
  'errors.address.loadFailed' as const satisfies MessageKey;

export const useGetAddresses = (): ActionResponse<UserAddress[], MessageKey> & {
  refetch: () => Promise<void>;
} => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchAddresses = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<UserAddress[]>({
        endpoint: SECURE_ENDPOINTS.USER.ADDRESSES,
      });

      if (response.error) {
        console.error('ERROR_LOAD_ADDRESSES', response.error);
        setStatus('error');
        setErrorMessage(response.messageCode ?? ADDRESSES_LOAD_ERROR);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setAddresses(response.data);
        setStatus('success');
      } else {
        setAddresses([]);
        setStatus('success');
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_ADDRESSES - Unexpected error');

      console.error('ERROR_LOAD_ADDRESSES_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(ADDRESSES_LOAD_ERROR);
    }
  }, [secureGet]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    data: addresses,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchAddresses,
  };
};
