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
  const { auth, forceLogout } = useAuth();

  const isAuthError = (response: { status?: number; error?: LangMap }) => {
    if (!response.error) {
      return false;
    }

    const errorText =
      response.error.en?.toLowerCase() + ' ' + response.error.es?.toLowerCase();

    const isUnauthorizedStatus =
      response.status === 401 || response.status === 403;
    const containsInvalidAuthMessage =
      errorText.includes('invalid token') ||
      errorText.includes('token invalid') ||
      errorText.includes('unauthorized') ||
      errorText.includes('no authorization') ||
      errorText.includes('not authenticated');

    return isUnauthorizedStatus || containsInvalidAuthMessage;
  };

  const handleAuthError = useCallback(
    async (response: { status?: number; error?: LangMap }) => {
      if (!isAuthError(response)) {
        return false;
      }

      console.log('AUTH_ERROR - Forcing logout due to invalid/expired session');
      await forceLogout();
      setStatus('idle');
      setCurrentUser(null);
      return true;
    },
    [forceLogout]
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<User>({
        endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
      });

      if (response.error) {
        if (await handleAuthError(response)) {
          return;
        }

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
  }, [secureGet, handleAuthError]);

  const refetchCurrentUser = useCallback(async () => {
    const response = await secureGet<User>({
      endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
    });

    if (response.error) {
      if (await handleAuthError(response)) {
        return;
      }

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
  }, [secureGet, callToast, handleAuthError]);

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
