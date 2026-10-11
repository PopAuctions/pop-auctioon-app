import {
  ActionResponse,
  LangMap,
  RequestStatus,
  InfoContentData,
} from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { createLocalizedMessage } from '@/i18n/api-message';

/**
 * Hook para obtener todo el contenido informativo de la app:
 * - About Us (Sobre nosotros)
 * - How It Works (Cómo funciona)
 * - FAQs (Preguntas frecuentes)
 */
export const useFetchInfo = (): ActionResponse<InfoContentData | null> => {
  const [data, setData] = useState<InfoContentData | null>(null);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchInfo = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await protectedGet<InfoContentData>({
        endpoint: PROTECTED_ENDPOINTS.INFO.CONTENT,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (!response.data) {
        setStatus('error');
        setErrorMessage(createLocalizedMessage('errors.info.contentMissing'));
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_INFO - Unexpected error');

      setStatus('error');
      setErrorMessage(createLocalizedMessage('errors.info.contentLoadFailed'));
    }
  }, [protectedGet]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return {
    data,
    status,
    refetch: fetchInfo,
    errorMessage,
    setErrorMessage,
  };
};
