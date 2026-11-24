import { ActionResponse, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { REQUEST_STATUS } from '@/constants';
import type { MessageKey } from '@/i18n';

const AUTO_BID_DATA_MISSING_ERROR =
  'errors.autoBid.dataMissing' as const satisfies MessageKey;
const AUTO_BID_DATA_LOAD_ERROR =
  'errors.autoBid.dataLoadFailed' as const satisfies MessageKey;

export const useFetchAutoBidsAmount = (
  articleId: string
): ActionResponse<number, MessageKey> => {
  const [data, setData] = useState<number>(0);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.loading);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchAutoBidsAmount = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);

      const response = await protectedGet<number>({
        endpoint: SECURE_ENDPOINTS.AUTO_BID.GET(articleId),
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.messageCode ?? AUTO_BID_DATA_LOAD_ERROR);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(AUTO_BID_DATA_MISSING_ERROR);
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_AUTO_BIDS - Unexpected error');

      setStatus('error');
      setErrorMessage(AUTO_BID_DATA_LOAD_ERROR);
    }
  }, [protectedGet, articleId]);

  useEffect(() => {
    fetchAutoBidsAmount();
  }, [fetchAutoBidsAmount]);

  return {
    data,
    status,
    refetch: fetchAutoBidsAmount,
    errorMessage,
    setErrorMessage,
  };
};
