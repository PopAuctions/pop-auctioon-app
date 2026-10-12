import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { ActionResponse, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const STORE_COMMISSION_FETCH_FAILED =
  'errors.store.commissionFetchFailed' as const satisfies MessageKey;
const STORE_COMMISSION_MISSING =
  'errors.store.commissionMissing' as const satisfies MessageKey;

export const useGetMyStoreCommission = (): ActionResponse<
  number,
  MessageKey
> => {
  const [commission, setCommission] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchStoreCommission = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<number>({
      endpoint: SECURE_ENDPOINTS.STORE.COMMISSION,
    });

    if (res.error) {
      setStatus('error');
      const messageCode = res.messageCode ?? STORE_COMMISSION_FETCH_FAILED;
      setErrorMessage(messageCode);
      return {
        message: messageCode,
      };
    }

    if (res.data === null || res.data === undefined) {
      setStatus('error');
      setErrorMessage(STORE_COMMISSION_MISSING);
      return;
    }

    setCommission(res.data);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchAuctionsMade = useCallback(async () => {
    const res = await secureGet<number>({
      endpoint: SECURE_ENDPOINTS.STORE.COMMISSION,
    });

    if (res.error || !res.data) {
      return;
    }

    setCommission(res.data);

    return;
  }, [secureGet]);

  useEffect(() => {
    fetchStoreCommission();
  }, [fetchStoreCommission]);

  return {
    data: commission,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchAuctionsMade,
  };
};
