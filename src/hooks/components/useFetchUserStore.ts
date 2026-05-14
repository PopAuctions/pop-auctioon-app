import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  Store,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export const useFetchUserStore = (): ActionResponse<Store | null> & {
  refetch: () => Promise<void>;
} => {
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { secureGet } = useSecureApi();

  const fetchUserStore = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<Store>({
        endpoint: SECURE_ENDPOINTS.USER.STORE,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);

        return;
      }

      setUserStore(response.data as Store);
      setStatus('success');
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
    const response = await secureGet<Store>({
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
      setUserStore(response.data);
      setStatus('success');
    }
  }, [secureGet, callToast]);

  useEffect(() => {
    fetchUserStore();
  }, [fetchUserStore]);

  return {
    data: userStore,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchCurrentUser,
  };
};
