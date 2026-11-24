import { ActionResponse, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { MessageKey } from '@/i18n';

const AVAILABLE_AUCTIONS_DATA_MISSING =
  'errors.auction.availableDataMissing' as const satisfies MessageKey;
const AVAILABLE_AUCTIONS_FETCH_FAILED =
  'errors.auction.availableFetchFailed' as const satisfies MessageKey;

interface Auction {
  label: string;
  value: string;
}

export const useFetchMyAvailableAuctions = (
  shouldFetch = true
): ActionResponse<Auction[], MessageKey> => {
  const [data, setData] = useState<Auction[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchMyAvailableAuctions = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<Auction[]>({
        endpoint: SECURE_ENDPOINTS.MY_AUCTIONS.AVAILABLE,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(
          response.messageCode ?? AVAILABLE_AUCTIONS_FETCH_FAILED
        );
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus('error');
        setErrorMessage(AVAILABLE_AUCTIONS_DATA_MISSING);
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_MY_AVAILABLE_AUCTIONS - Unexpected error'
      );

      setStatus('error');
      setErrorMessage(AVAILABLE_AUCTIONS_FETCH_FAILED);
    }
  }, [secureGet]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchMyAvailableAuctions();
  }, [fetchMyAvailableAuctions, shouldFetch]);

  return {
    data,
    status,
    refetch: fetchMyAvailableAuctions,
    errorMessage,
    setErrorMessage,
  };
};
