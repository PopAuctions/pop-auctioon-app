import { ActionResponse, CountryValue, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { REQUEST_STATUS } from '@/constants/app';
import type { MessageKey } from '@/i18n';

const STORE_COUNTRY_MISSING =
  'errors.store.countryMissing' as const satisfies MessageKey;
const STORE_COUNTRY_FETCH_FAILED =
  'errors.store.countryFetchFailed' as const satisfies MessageKey;

export const useFetchStoreCountryByArticleId = (
  articleId: string
): ActionResponse<CountryValue | null, MessageKey> => {
  const [data, setData] = useState<CountryValue | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchStoreCountryByArticleId = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);

      const response = await secureGet<CountryValue | null>({
        endpoint: SECURE_ENDPOINTS.STORE.COUNTRY(articleId),
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.messageCode ?? STORE_COUNTRY_FETCH_FAILED);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(STORE_COUNTRY_MISSING);
        return;
      }

      setData(response.data);
      setStatus(REQUEST_STATUS.success);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_STORE_COUNTRY_BY_ARTICLE_ID - Unexpected error'
      );

      setStatus(REQUEST_STATUS.error);
      setErrorMessage(STORE_COUNTRY_FETCH_FAILED);
    }
  }, [secureGet, articleId]);

  useEffect(() => {
    fetchStoreCountryByArticleId();
  }, [fetchStoreCountryByArticleId, articleId]);

  return {
    data,
    status,
    refetch: fetchStoreCountryByArticleId,
    errorMessage,
    setErrorMessage,
  };
};
