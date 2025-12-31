import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { LangMap } from '@/types/types';
import { REQUEST_STATUS } from '@/constants';

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
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePost } = useSecureApi();

  const createPayment = async (
    params: CreateArticlePaymentParams
  ): Promise<{ userPaymentId: number | null; error: LangMap | null }> => {
    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await securePost<CreateArticlePaymentResponse>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_SINGLE_ARTICLE_PAYMENT,
        data: params,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return { userPaymentId: null, error: response.error };
      }

      if (!response.data) {
        const error: LangMap = {
          es: 'No se recibió respuesta del servidor',
          en: 'No response received from server',
        };
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(error);
        return { userPaymentId: null, error };
      }

      setStatus(REQUEST_STATUS.success);
      return { userPaymentId: response.data.userPaymentId, error: null };
    } catch (error) {
      const errorMsg: LangMap = {
        es: 'Error al crear el registro de pago',
        en: 'Error creating payment record',
      };
      console.error('[useCreateArticlesPayment] Unexpected error:', error);
      setStatus(REQUEST_STATUS.error);
      setErrorMessage(errorMsg);
      return { userPaymentId: null, error: errorMsg };
    }
  };

  const rejectPayment = async (
    params: RejectArticlePaymentParams
  ): Promise<{ success: boolean; error: LangMap | null }> => {
    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.PAYMENT.REJECT_SINGLE_ARTICLE_PAYMENT,
        data: params,
      });

      if (response.error) {
        setStatus(REQUEST_STATUS.error);
        setErrorMessage(response.error);
        return { success: false, error: response.error };
      }

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
    createPayment,
    rejectPayment,
    status,
    errorMessage,
  };
};
