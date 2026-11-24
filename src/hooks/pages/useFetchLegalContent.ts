import { ActionResponse, RequestStatus, LegalContentData } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { MessageKey } from '@/i18n';

const LEGAL_CONTENT_MISSING_ERROR =
  'errors.legal.contentMissing' as const satisfies MessageKey;
const LEGAL_CONTENT_LOAD_ERROR =
  'errors.legal.contentLoadFailed' as const satisfies MessageKey;

/**
 * Hook para obtener todo el contenido legal de la app:
 * - Cookies Policy (estructura completa)
 * - Privacy Policy (estructura completa)
 * - Terms and Conditions (URL del PDF)
 */
export const useFetchLegalContent = (): ActionResponse<
  LegalContentData | null,
  MessageKey
> => {
  const [data, setData] = useState<LegalContentData | null>(null);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchLegalContent = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await protectedGet<LegalContentData>({
        endpoint: PROTECTED_ENDPOINTS.LEGAL.CONTENT,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.messageCode ?? LEGAL_CONTENT_LOAD_ERROR);
        return;
      }

      if (!response.data) {
        setStatus('error');
        setErrorMessage(LEGAL_CONTENT_MISSING_ERROR);
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_LEGAL_CONTENT - Unexpected error');

      setStatus('error');
      setErrorMessage(LEGAL_CONTENT_LOAD_ERROR);
    }
  }, [protectedGet]);

  useEffect(() => {
    fetchLegalContent();
  }, [fetchLegalContent]);

  return {
    data,
    status,
    refetch: fetchLegalContent,
    errorMessage,
    setErrorMessage,
  };
};
