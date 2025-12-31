import {
  ActionResponse,
  LangMap,
  RequestStatus,
  LegalContentData,
} from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

/**
 * Hook para obtener todo el contenido legal de la app:
 * - Cookies Policy (estructura completa)
 * - Privacy Policy (estructura completa)
 * - Terms and Conditions (URL del PDF)
 */
export const useFetchLegalContent =
  (): ActionResponse<LegalContentData | null> => {
    const [data, setData] = useState<LegalContentData | null>(null);
    const [status, setStatus] = useState<RequestStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
    const { protectedGet } = useSecureApi();

    const fetchLegalContent = useCallback(async () => {
      try {
        setStatus('loading');

        const response = await protectedGet<LegalContentData>({
          endpoint: PROTECTED_ENDPOINTS.LEGAL.CONTENT,
        });

        if (response.error) {
          setStatus('error');
          setErrorMessage(response.error);
          return;
        }

        if (!response.data) {
          setStatus('error');
          setErrorMessage({
            en: 'Legal content data is missing',
            es: 'Faltan los datos del contenido legal',
          });
          return;
        }

        setData(response.data);
        setStatus('success');
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error occurred';

        sentryErrorReport(
          errorMsg,
          'USE_FETCH_LEGAL_CONTENT - Unexpected error'
        );

        const message: LangMap = {
          en: 'Error fetching legal content',
          es: 'Error al cargar el contenido legal',
        };

        setStatus('error');
        setErrorMessage(message);
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
