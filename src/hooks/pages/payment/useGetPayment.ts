import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { ActionResponse, RequestStatus, UserPayment } from '@/types/types';
import type { MessageKey } from '@/i18n';
import { useCallback, useEffect, useState } from 'react';

export const useGetPayment = ({
  paymentId,
}: {
  paymentId: string;
}): ActionResponse<UserPayment | null, MessageKey> => {
  const [payment, setPayment] = useState<UserPayment | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchPayment = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<UserPayment>({
      endpoint: SECURE_ENDPOINTS.USER.PAYMENT_BY_ID(paymentId),
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(res.messageCode ?? 'errors.payment.detailLoadFailed');
      return {
        message: res.messageCode ?? 'errors.payment.detailLoadFailed',
      };
    }

    setPayment(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet, paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  return {
    data: payment,
    status,
    errorMessage,
    setErrorMessage,
  };
};
