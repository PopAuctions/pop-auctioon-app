import { useEffect, useState, useCallback } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  UserBillingInfo,
} from '@/types/types';
import type { BillingSchemaType } from '@/utils/schemas/billingSchemas';

// ==================== GET BILLING ====================
export const useGetBilling = (): ActionResponse<UserBillingInfo[]> & {
  refetch: () => Promise<void>;
} => {
  const [data, setData] = useState<UserBillingInfo[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchBilling = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await secureGet<UserBillingInfo[]>({
        endpoint: SECURE_ENDPOINTS.USER.BILLING,
      });

      if (response.error) {
        console.error('ERROR_LOAD_BILLING', response.error);
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (!response.data) {
        console.error('ERROR_NO_BILLING_DATA_RECEIVED');
        const message: LangMap = {
          en: 'No billing data received',
          es: 'No se recibieron datos de facturación',
        };
        setStatus('error');
        setErrorMessage(message);
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_BILLING - Unexpected error');

      console.error('ERROR_LOAD_BILLING_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error loading billing information',
        es: 'Error al cargar la información de facturación',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [secureGet]); // Stable dependency

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]); // fetchBilling is now stable

  return {
    data,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchBilling, // Return the stable callback
  };
};

// ==================== CREATE BILLING ====================
export const useCreateBilling = (): ActionResponse<null> & {
  createBilling: (data: BillingSchemaType) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePost } = useSecureApi();

  const createBilling = async (data: BillingSchemaType): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.USER.BILLING,
        data,
      });

      if (response.error) {
        console.error('ERROR_CREATE_BILLING', response.error);
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      console.log('SUCCESS_CREATE_BILLING');
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_CREATE_BILLING - Unexpected error');

      console.error('ERROR_CREATE_BILLING_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error creating billing information',
        es: 'Error al crear la información de facturación',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  };

  return {
    data: null,
    status,
    errorMessage,
    setErrorMessage,
    createBilling,
  };
};

// ==================== UPDATE BILLING ====================
export const useUpdateBilling = (): ActionResponse<null> & {
  updateBilling: (id: string, data: BillingSchemaType) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePatch } = useSecureApi();

  const updateBilling = async (
    id: string,
    data: BillingSchemaType
  ): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await securePatch({
        endpoint: SECURE_ENDPOINTS.USER.BILLING_BY_ID(id),
        data,
      });

      if (response.error) {
        console.error('ERROR_UPDATE_BILLING', response.error);
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      console.log('SUCCESS_UPDATE_BILLING');
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_UPDATE_BILLING - Unexpected error');

      console.error('ERROR_UPDATE_BILLING_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error updating billing information',
        es: 'Error al actualizar la información de facturación',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  };

  return {
    data: null,
    status,
    errorMessage,
    setErrorMessage,
    updateBilling,
  };
};

// ==================== DELETE BILLING ====================
export const useDeleteBilling = (): ActionResponse<null> & {
  deleteBilling: (id: string) => Promise<{ error: LangMap | null }>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureDelete } = useSecureApi();

  const deleteBilling = async (
    id: string
  ): Promise<{ error: LangMap | null }> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await secureDelete({
        endpoint: SECURE_ENDPOINTS.USER.BILLING_BY_ID(id),
      });

      if (response.error) {
        console.error('ERROR_DELETE_BILLING', response.error);
        setStatus('error');
        setErrorMessage(response.error);
        return { error: response.error };
      }

      console.log('SUCCESS_DELETE_BILLING');
      setStatus('success');
      return { error: null };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_DELETE_BILLING - Unexpected error');

      console.error('ERROR_DELETE_BILLING_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error deleting billing information',
        es: 'Error al eliminar la información de facturación',
      };

      setStatus('error');
      setErrorMessage(message);
      return { error: message };
    }
  };

  return {
    data: null,
    status,
    errorMessage,
    setErrorMessage,
    deleteBilling,
  };
};
