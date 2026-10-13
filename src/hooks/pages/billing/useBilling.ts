import { useEffect, useState, useCallback } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  RequestStatus,
  UserBillingInfo,
} from '@/types/types';
import type { BillingSchemaType } from '@/utils/schemas/billingSchemas';
import type { MessageKey } from '@/i18n';

const BILLING_LOAD_FAILED =
  'errors.billing.loadFailed' as const satisfies MessageKey;
const BILLING_NO_DATA = 'errors.billing.noData' as const satisfies MessageKey;
const BILLING_CREATE_UNEXPECTED =
  'errors.billing.createUnexpected' as const satisfies MessageKey;
const BILLING_UPDATE_UNEXPECTED =
  'errors.billing.updateUnexpected' as const satisfies MessageKey;
const BILLING_DELETE_UNEXPECTED =
  'errors.billing.deleteUnexpected' as const satisfies MessageKey;

// ==================== GET BILLING ====================
export const useGetBilling = (): ActionResponse<
  UserBillingInfo[],
  MessageKey
> & {
  refetch: () => Promise<void>;
} => {
  const [data, setData] = useState<UserBillingInfo[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
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
        setErrorMessage(response.messageCode ?? BILLING_LOAD_FAILED);
        return;
      }

      if (!response.data) {
        console.error('ERROR_NO_BILLING_DATA_RECEIVED');
        setStatus('error');
        setErrorMessage(BILLING_NO_DATA);
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_BILLING - Unexpected error');

      console.error('ERROR_LOAD_BILLING_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(BILLING_LOAD_FAILED);
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
export const useCreateBilling = (): ActionResponse<null, MessageKey> & {
  createBilling: (data: BillingSchemaType) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
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
        setErrorMessage(response.messageCode ?? BILLING_CREATE_UNEXPECTED);
        return;
      }

      console.log('SUCCESS_CREATE_BILLING');
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_CREATE_BILLING - Unexpected error');

      console.error('ERROR_CREATE_BILLING_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(BILLING_CREATE_UNEXPECTED);
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
export const useUpdateBilling = (): ActionResponse<null, MessageKey> & {
  updateBilling: (id: string, data: BillingSchemaType) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
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
        setErrorMessage(response.messageCode ?? BILLING_UPDATE_UNEXPECTED);
        return;
      }

      console.log('SUCCESS_UPDATE_BILLING');
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_UPDATE_BILLING - Unexpected error');

      console.error('ERROR_UPDATE_BILLING_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(BILLING_UPDATE_UNEXPECTED);
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
export const useDeleteBilling = (): ActionResponse<null, MessageKey> & {
  deleteBilling: (id: string) => Promise<{ error: MessageKey | null }>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureDelete } = useSecureApi();

  const deleteBilling = async (
    id: string
  ): Promise<{ error: MessageKey | null }> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await secureDelete({
        endpoint: SECURE_ENDPOINTS.USER.BILLING_BY_ID(id),
      });

      if (response.error) {
        console.error('ERROR_DELETE_BILLING', response.error);
        setStatus('error');
        const message = response.messageCode ?? BILLING_DELETE_UNEXPECTED;
        setErrorMessage(message);
        return { error: message };
      }

      console.log('SUCCESS_DELETE_BILLING');
      setStatus('success');
      return { error: null };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_DELETE_BILLING - Unexpected error');

      console.error('ERROR_DELETE_BILLING_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(BILLING_DELETE_UNEXPECTED);
      return { error: BILLING_DELETE_UNEXPECTED };
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
