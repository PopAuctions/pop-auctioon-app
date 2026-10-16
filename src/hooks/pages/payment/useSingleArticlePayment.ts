import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import type { MessageKey } from '@/i18n';

const PAYMENT_RECORD_CREATE_FAILED =
  'errors.payment.recordCreateFailed' as const satisfies MessageKey;
const PAYMENT_NO_RESPONSE =
  'errors.payment.noResponse' as const satisfies MessageKey;
const PAYMENT_REVERT_FAILED =
  'errors.payment.revertFailed' as const satisfies MessageKey;

interface CreateArticlePaymentParams {
  articleId: string;
  clientTotalAmount: number;
  clientIntent: string;
  country: string;
  userAddressId: string;
  discount?: { code: string; amount: number } | null;
}

interface CreateArticlePaymentResponse {
  userPaymentId: number;
}

interface RejectArticlePaymentParams {
  userPaymentId: number;
  errorCode?: string;
  errorDescription?: string;
}

export const useSingleArticlePayment = () => {
  const [status, setStatus] = useState<string>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { securePost } = useSecureApi();

  const createPayment = async (
    params: CreateArticlePaymentParams
  ): Promise<{ userPaymentId: number | null; error: MessageKey | null }> => {
    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await securePost<CreateArticlePaymentResponse>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_SINGLE_ARTICLE_PAYMENT,
        data: params,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        const error = response.messageCode ?? PAYMENT_RECORD_CREATE_FAILED;
        setErrorMessage(error);
        return { userPaymentId: null, error };
      }

      if (!response.data) {
        const error = PAYMENT_NO_RESPONSE;
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(error);
        return { userPaymentId: null, error };
      }

      setStatus(REQUEST_STATUS.success);
      return { userPaymentId: response.data.userPaymentId, error: null };
    } catch (error) {
      const errorMsg = PAYMENT_RECORD_CREATE_FAILED;
      console.error('[useCreateArticlesPayment] Unexpected error:', error);
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(errorMsg);
      return { userPaymentId: null, error: errorMsg };
    }
  };

  const rejectPayment = async (
    params: RejectArticlePaymentParams
  ): Promise<{ success: boolean; error: MessageKey | null }> => {
    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.PAYMENT.REJECT_SINGLE_ARTICLE_PAYMENT,
        data: params,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        const error = response.messageCode ?? PAYMENT_REVERT_FAILED;
        setErrorMessage(error);
        return { success: false, error };
      }

      setStatus(REQUEST_STATUS.success);
      return { success: true, error: null };
    } catch (error) {
      const errorMsg = PAYMENT_REVERT_FAILED;
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
    createPayment,
    rejectPayment,
    status,
    errorMessage,
  };
};
