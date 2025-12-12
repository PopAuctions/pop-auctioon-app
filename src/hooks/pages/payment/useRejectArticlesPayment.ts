/**
 * Hook para rechazar/revertir un pago cuando Stripe falla
 * Marca el registro en BD como REJECTED
 * Patrón idéntico a web (rejectArticlesPayment)
 */

import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { LangMap } from '@/types/types';
import { REQUEST_STATUS } from '@/constants';

interface RejectArticlesPaymentParams {
  userPaymentId: number;
  errorCode?: string;
  errorDescription?: string;
}

export function useRejectArticlesPayment() {
  const { securePost } = useSecureApi();
  const [status, setStatus] = useState<string>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);

  const rejectPayment = async (
    params: RejectArticlesPaymentParams
  ): Promise<{ success: boolean; error: LangMap | null }> => {
    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      console.log('[useRejectArticlesPayment] Rejecting payment:', {
        userPaymentId: params.userPaymentId,
        errorCode: params.errorCode,
      });

      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.PAYMENT.REJECT_ARTICLES_PAYMENT,
        data: params,
      });

      if (response.error) {
        console.error(
          '[useRejectArticlesPayment] Error from backend:',
          response.error
        );
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return { success: false, error: response.error };
      }

      console.log('[useRejectArticlesPayment] Payment rejected successfully');
      setStatus(REQUEST_STATUS.success);
      return { success: true, error: null };
    } catch (error) {
      const errorMsg: LangMap = {
        es: 'Error al revertir el pago',
        en: 'Error reverting payment',
      };
      console.error('[useRejectArticlesPayment] Unexpected error:', error);
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  return {
    rejectPayment,
    status,
    errorMessage,
  };
}
