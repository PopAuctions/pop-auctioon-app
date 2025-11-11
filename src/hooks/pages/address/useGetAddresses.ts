import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  UserAddress,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

export const useGetAddresses = (): ActionResponse<UserAddress[]> & {
  refetch: () => Promise<void>;
} => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
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
        setErrorMessage(response.error);
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
      setErrorMessage({
        en: 'Error loading addresses',
        es: 'Error al cargar las direcciones',
      });
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
