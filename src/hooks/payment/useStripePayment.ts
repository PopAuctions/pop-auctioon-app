/**
 * Hook para gestionar pagos con Stripe Payment Sheet
 * Maneja la creación del Payment Intent y presentación del Payment Sheet
 */

import { useState, useCallback, useRef } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import * as Sentry from '@sentry/react-native';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { LangMap, RequestStatus } from '@/types/types';

interface CreatePaymentIntentResponse {
  id: string;
  clientSecret: string;
}

interface UseStripePaymentReturn {
  initializePaymentSheet: (
    amount: number,
    selectedItems: number[]
  ) => Promise<string | null>; // Devuelve el Payment Intent ID
  presentPaymentSheet: () => Promise<{
    success: boolean;
    error?: { code: string; message: string };
  }>;
  isLoading: boolean;
  status: RequestStatus;
  errorMessage: LangMap | null;
  clearError: () => void;
  paymentIntentId: string | null;
}

export const useStripePayment = (): UseStripePaymentReturn => {
  const { initPaymentSheet, presentPaymentSheet: presentStripeSheet } =
    useStripe();
  const { securePost } = useSecureApi();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const paymentIntentIdRef = useRef<string | null>(null);

  /**
   * Inicializa el Payment Sheet con el Payment Intent
   * @returns Payment Intent ID si exitoso, null si falla
   */
  const initializePaymentSheet = useCallback(
    async (amount: number, selectedItems: number[]): Promise<string | null> => {
      setIsLoading(true);
      setStatus('loading');
      setErrorMessage(null);

      try {
        const response = await securePost<CreatePaymentIntentResponse>({
          endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_PAYMENT_INTENT,
          data: {
            amount,
            selectedItems,
          },
        });

        if (response.error) {
          setErrorMessage(response.error);
          setStatus('error');
          setIsLoading(false);
          return null;
        }

        if (!response.data || !response.data.clientSecret) {
          const errorMsg: LangMap = {
            es: 'No se pudo crear el intento de pago',
            en: 'Could not create payment intent',
          };
          setErrorMessage(errorMsg);
          setStatus('error');
          setIsLoading(false);
          return null;
        }

        // Guardar el Payment Intent ID para usarlo en el registro de BD
        const paymentIntentId = response.data.id;
        paymentIntentIdRef.current = paymentIntentId;

        // Inicializar Payment Sheet con el client secret
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'PopAuction',
          paymentIntentClientSecret: response.data.clientSecret,
          defaultBillingDetails: {
            // Opcional: pre-llenar con datos del usuario
          },
        });

        if (initError) {
          console.error(
            '[useStripePayment] Error initializing Payment Sheet:',
            initError.message
          );
          const errorMsg: LangMap = {
            es: 'Error al inicializar el formulario de pago',
            en: 'Error initializing payment form',
          };
          setErrorMessage(errorMsg);
          setStatus('error');
          setIsLoading(false);

          Sentry.captureException(
            `STRIPE_INIT_ERROR: ${initError.message ?? 'Unknown'}`
          );
          return null;
        }

        setStatus('success');
        setIsLoading(false);
        return paymentIntentId; // Devolver el ID directamente
      } catch (error: any) {
        const errorMsg: LangMap = {
          es: 'Error inesperado al procesar el pago',
          en: 'Unexpected error processing payment',
        };
        setErrorMessage(errorMsg);
        setStatus('error');
        setIsLoading(false);

        Sentry.captureException(
          `STRIPE_PAYMENT_ERROR: ${error?.message ?? 'Unknown'}`
        );
        return null;
      }
    },
    [securePost, initPaymentSheet]
  );

  /**
   * Presenta el Payment Sheet al usuario
   * Retorna objeto con success y error para mejor manejo
   */
  const presentPaymentSheet = useCallback(async (): Promise<{
    success: boolean;
    error?: { code: string; message: string };
  }> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error: presentError } = await presentStripeSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          setIsLoading(false);
          return {
            success: false,
            error: {
              code: presentError.code,
              message: 'Payment cancelled by user',
            },
          };
        }

        const errorMsg: LangMap = {
          es: 'Error al procesar el pago',
          en: 'Error processing payment',
        };
        setErrorMessage(errorMsg);
        setIsLoading(false);

        Sentry.captureException(
          `STRIPE_PRESENT_ERROR: ${presentError.message ?? 'Unknown'}`
        );
        return {
          success: false,
          error: {
            code: presentError.code ?? 'UNKNOWN',
            message: presentError.message ?? 'Unknown error',
          },
        };
      }

      // Pago exitoso
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      const errorMsg: LangMap = {
        es: 'Error inesperado al presentar el pago',
        en: 'Unexpected error presenting payment',
      };
      setErrorMessage(errorMsg);
      setIsLoading(false);

      Sentry.captureException(
        `STRIPE_PAYMENT_UNEXPECTED: ${error?.message ?? 'Unknown'}`
      );
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: error?.message ?? 'Unknown error',
        },
      };
    }
  }, [presentStripeSheet]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    initializePaymentSheet,
    presentPaymentSheet,
    isLoading,
    status,
    errorMessage,
    clearError,
    paymentIntentId: paymentIntentIdRef.current,
  };
};
