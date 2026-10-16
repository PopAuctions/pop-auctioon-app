import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, RequestStatus, UserPayment } from '@/types/types';
import type { MessageKey } from '@/i18n';
import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';

/**
 * Hook para obtener el historial de pagos del usuario
 */
export const useGetPaymentHistory = (): ActionResponse<
  UserPayment[],
  MessageKey
> & {
  refetch: () => Promise<void>;
} => {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<UserPayment[]>({
        endpoint: SECURE_ENDPOINTS.USER.PAYMENT_HISTORY,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(
          response.messageCode ?? 'errors.payment.historyLoadFailed'
        );
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setPayments(response.data);
        setStatus('success');
      } else {
        setPayments([]);
        setStatus('success');
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_PAYMENT_HISTORY - Unexpected error');

      console.error('ERROR_LOAD_PAYMENT_HISTORY_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage('errors.payment.historyLoadFailed');
    }
  }, [secureGet]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  return {
    data: payments,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchPaymentHistory,
  };
};
