import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { LangMap, RequestStatus } from '@/types/types';
import type { AddressSchemaType } from '@/utils/schemas';

interface UseCreateAddressReturn {
  createAddress: (data: AddressSchemaType) => Promise<{
    success: boolean;
    message?: LangMap;
  }>;
  status: RequestStatus;
  errorMessage: LangMap | null;
  setErrorMessage: (message: LangMap | null) => void;
}

export const useCreateAddress = (): UseCreateAddressReturn => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePost } = useSecureApi();

  const createAddress = async (
    data: AddressSchemaType
  ): Promise<{ success: boolean; message?: LangMap }> => {
    try {
      setStatus('loading');

      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.USER.CREATE_ADDRESS,
        data,
      });

      if (response.error) {
        console.error('ERROR_CREATE_ADDRESS', response.error);
        setStatus('error');
        setErrorMessage(response.error);
        return {
          success: false,
          message: response.error,
        };
      }

      setStatus('success');
      return {
        success: true,
        message: {
          en: 'Address created successfully',
          es: 'Dirección creada exitosamente',
        },
      };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_CREATE_ADDRESS - Unexpected error');

      console.error('ERROR_CREATE_ADDRESS_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error creating address',
        es: 'Error al crear la dirección',
      };

      setStatus('error');
      setErrorMessage(message);

      return {
        success: false,
        message,
      };
    }
  };

  return {
    createAddress,
    status,
    errorMessage,
    setErrorMessage,
  };
};
