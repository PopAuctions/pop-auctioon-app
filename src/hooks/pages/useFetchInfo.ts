import { ActionResponse, RequestStatus, InfoContentData } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { MessageKey } from '@/i18n';

const INFO_CONTENT_MISSING_ERROR =
  'errors.info.contentMissing' as const satisfies MessageKey;
const INFO_CONTENT_LOAD_ERROR =
  'errors.info.contentLoadFailed' as const satisfies MessageKey;

/**
 * Hook para obtener todo el contenido informativo de la app:
 * - About Us (Sobre nosotros)
 * - How It Works (Cómo funciona)
 * - FAQs (Preguntas frecuentes)
 */
export const useFetchInfo = (): ActionResponse<
  InfoContentData | null,
  MessageKey
> => {
  const [data, setData] = useState<InfoContentData | null>(null);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchInfo = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await protectedGet<InfoContentData>({
        endpoint: PROTECTED_ENDPOINTS.INFO.CONTENT,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.messageCode ?? INFO_CONTENT_LOAD_ERROR);
        return;
      }

      if (!response.data) {
        setStatus('error');
        setErrorMessage(INFO_CONTENT_MISSING_ERROR);
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_INFO - Unexpected error');

      setStatus('error');
      setErrorMessage(INFO_CONTENT_LOAD_ERROR);
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
