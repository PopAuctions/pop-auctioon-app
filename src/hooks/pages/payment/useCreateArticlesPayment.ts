/**
 * Hook para crear el registro de pago en la base de datos
 * Debe llamarse ANTES de presentar el Payment Sheet
 * Patrón idéntico a web (createArticlesPayment)
 */

import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { LangMap } from '@/types/types';
import { REQUEST_STATUS } from '@/constants';

interface CreateArticlesPaymentParams {
  auctionId: string;
  articlesIds: number[];
  clientTotalAmount: number;
  clientIntent: string;
  country: string;
  userAddressId: string;
  discount?: { code: string; amount: number } | null;
}

interface CreateArticlesPaymentResponse {
  userPaymentId: number;
}

export function useCreateArticlesPayment() {
  const { securePost } = useSecureApi();
  const [status, setStatus] = useState<string>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);

  const createPayment = async (
    params: CreateArticlesPaymentParams
  ): Promise<{ userPaymentId: number | null; error: LangMap | null }> => {
    setStatus(REQUEST_STATUS.loading);
    setErrorMessage(null);

    try {
      const response = await securePost<CreateArticlesPaymentResponse>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_ARTICLES_PAYMENT,
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

  return {
    createPayment,
    status,
    errorMessage,
  };
}
