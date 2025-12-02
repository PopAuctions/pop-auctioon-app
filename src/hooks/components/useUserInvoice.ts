import { useEffect, useState, useCallback } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  GeneratedInvoice,
  Lang,
  LangMap,
  RequestStatus,
} from '@/types/types';
import type { InvoicePayloadType } from '@/utils/schemas/invoiceSchemas';
import { useToast } from '../useToast';

// ==================== GET INVOICE ====================
export const useGetUserInvoice = ({
  paymentID,
}: {
  paymentID: string;
}): ActionResponse<GeneratedInvoice | null> & {
  refetch: () => Promise<void>;
} => {
  const [data, setData] = useState<GeneratedInvoice | null>(null);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchUserInvoice = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await secureGet<GeneratedInvoice>({
        endpoint: SECURE_ENDPOINTS.USER.INVOICE.GET(paymentID),
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      setData(response.data ?? null);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_INVOICE - Unexpected error');

      console.error('ERROR_LOAD_INVOICE_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error loading invoice information',
        es: 'Error al cargar la información de facturación',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [secureGet, paymentID]);

  useEffect(() => {
    fetchUserInvoice();
  }, [fetchUserInvoice]);

  return {
    data,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchUserInvoice,
  };
};

// ==================== CREATE Invoice ====================
export const useCreateUserInvoice = ({
  paymentID,
  locale,
}: {
  paymentID: string;
  locale: Lang;
}): ActionResponse<null> & {
  createUserInvoice: (data: InvoicePayloadType) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const createUserInvoice = async (data: InvoicePayloadType): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.USER.INVOICE.CREATE(paymentID),
        data,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      callToast({
        variant: 'success',
        description: {
          es: 'Factura creada con éxito',
          en: 'Invoice created successfully',
        },
      });

      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_CREATE_INVOICE - Unexpected error');

      console.error('ERROR_CREATE_INVOICE_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error creating invoice information',
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
    createUserInvoice,
  };
};
