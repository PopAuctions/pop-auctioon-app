import {
  ActionResponse,
  CountryValue,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { REQUEST_STATUS } from '@/constants/app';
import { createLocalizedMessage } from '@/i18n/api-message';

export const useFetchStoreCountryByArticleId = (
  articleId: string
): ActionResponse<CountryValue | null> => {
  const [data, setData] = useState<CountryValue | null>(null);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchStoreCountryByArticleId = useCallback(async () => {
    try {
      setStatus(REQUEST_STATUS.loading);

      const response = await secureGet<CountryValue | null>({
        endpoint: SECURE_ENDPOINTS.STORE.COUNTRY(articleId),
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(createLocalizedMessage('errors.store.countryMissing'));
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
      setErrorMessage(
        createLocalizedMessage('errors.store.countryFetchFailed')
      );
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
