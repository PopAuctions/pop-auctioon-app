import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { supabase } from '@/utils/supabase/supabase-store';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  User,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';

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
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { secureGet } = useSecureApi();
  const { auth } = useAuth();

  const fetchCurrentUser = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<User>({
        endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);

        // Si el usuario fue eliminado de la BD, cerrar sesión automáticamente
        const isUserNotFound =
          response.error.en?.toLowerCase().includes('user not found') ||
          response.error.es?.toLowerCase().includes('usuario no encontrado') ||
          response.error.en?.toLowerCase().includes('not found');

        if (isUserNotFound) {
          console.log('USER_NOT_FOUND - Closing session automatically');
          await supabase.auth.signOut();
        }

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

  const refetchCurrentUser = useCallback(async () => {
    const response = await secureGet<User>({
      endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
    });

    if (response.error) {
      callToast({
        variant: 'error',
        description: {
          en: 'Could not update user data',
          es: 'No se pudieron actualizar los datos del usuario',
        },
      });
      return;
    }

    if (response.data) {
      setCurrentUser(response.data);
      setStatus('success');
    }
  }, [secureGet, callToast]);

  useEffect(() => {
    if (auth.state !== 'authenticated') {
      setStatus('idle');
      setCurrentUser(null);
      return;
    }

    fetchCurrentUser();
  }, [auth.state, fetchCurrentUser]);

  return {
    data: currentUser,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchCurrentUser,
  };
};
