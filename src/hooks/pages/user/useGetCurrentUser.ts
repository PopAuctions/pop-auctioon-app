import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  User,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para obtener los datos del usuario actual autenticado
 *
 * @returns {ActionResponse<User>} Datos del usuario con estado de carga y refetch
 *
 * @example
 * ```tsx
 * const { data: currentUser, status, errorMessage, refetch } = useGetCurrentUser();
 *
 * if (status === 'loading') return <Loading />;
 * if (status === 'error') return <ErrorView message={errorMessage[locale]} />;
 * if (currentUser) {
 *   // Usar datos del usuario
 *   console.log(currentUser.name, currentUser.email);
 * }
 * ```
 */
export const useGetCurrentUser = (): ActionResponse<User | null> & {
  refetch: () => Promise<void>;
} => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchCurrentUser = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<User>({
        endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (response.data) {
        setCurrentUser(response.data);
        setStatus('success');
      } else {
        setCurrentUser(null);
        setStatus('error');
        setErrorMessage({
          en: 'No user data received',
          es: 'No se recibieron datos del usuario',
        });
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_CURRENT_USER - Unexpected error');

      console.error('ERROR_LOAD_CURRENT_USER_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage({
        en: 'Error loading user data',
        es: 'Error al cargar datos del usuario',
      });
    }
  }, [secureGet]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    data: currentUser,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchCurrentUser,
  };
};
