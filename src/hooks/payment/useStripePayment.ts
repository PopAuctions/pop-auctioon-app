/**
 * Hook para gestionar pagos con Stripe Payment Sheet
 * Maneja la creación del Payment Intent y presentación del Payment Sheet
 */

import { useState, useCallback } from 'react';
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
  ) => Promise<boolean>;
  presentPaymentSheet: () => Promise<boolean>;
  isLoading: boolean;
  status: RequestStatus;
  errorMessage: LangMap | null;
  clearError: () => void;
}

export const useStripePayment = (): UseStripePaymentReturn => {
  const { initPaymentSheet, presentPaymentSheet: presentStripeSheet } =
    useStripe();
  const { securePost } = useSecureApi();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);

  /**
   * Inicializa el Payment Sheet con el Payment Intent
   */
  const initializePaymentSheet = useCallback(
    async (amount: number, selectedItems: number[]): Promise<boolean> => {
      console.log('\n🔧 [useStripePayment] initializePaymentSheet llamado');
      console.log('💰 [useStripePayment] amount:', amount);
      console.log('📦 [useStripePayment] selectedItems:', selectedItems);
      console.log(
        '✅ [useStripePayment] selectedItems types:',
        selectedItems.map((id) => `${id} (${typeof id})`)
      );

      setIsLoading(true);
      setStatus('loading');
      setErrorMessage(null);

      try {
        // Crear Payment Intent en el backend
        console.log(
          '🔄 [useStripePayment] Llamando a backend para crear Payment Intent...'
        );
        const response = await securePost<CreatePaymentIntentResponse>({
          endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_PAYMENT_INTENT,
          data: {
            amount,
            selectedItems,
          },
        });

        console.log(
          '📡 [useStripePayment] Respuesta del backend:',
          response.error ? 'ERROR' : 'SUCCESS'
        );

        if (response.error) {
          console.error(
            '❌ [useStripePayment] Error del backend:',
            response.error
          );
          setErrorMessage(response.error);
          setStatus('error');
          setIsLoading(false);
          return false;
        }

        if (!response.data || !response.data.clientSecret) {
          console.error(
            '❌ [useStripePayment] No se recibió clientSecret del backend'
          );
          const errorMsg: LangMap = {
            es: 'No se pudo crear el intento de pago',
            en: 'Could not create payment intent',
          };
          setErrorMessage(errorMsg);
          setStatus('error');
          setIsLoading(false);
          return false;
        }

        console.log(
          '✅ [useStripePayment] clientSecret recibido correctamente'
        );
        console.log(
          '🔄 [useStripePayment] Inicializando Stripe Payment Sheet...'
        );

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
            '❌ [useStripePayment] Error al inicializar Payment Sheet:',
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
          return false;
        }

        console.log(
          '✅ [useStripePayment] Payment Sheet inicializado exitosamente'
        );
        setStatus('success');
        setIsLoading(false);
        return true;
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
        return false;
      }
    },
    [securePost, initPaymentSheet]
  );

  /**
   * Presenta el Payment Sheet al usuario
   */
  const presentPaymentSheet = useCallback(async (): Promise<boolean> => {
    console.log('\n🔧 [useStripePayment] presentPaymentSheet llamado');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log(
        '🔄 [useStripePayment] Mostrando Payment Sheet al usuario...'
      );
      const { error: presentError } = await presentStripeSheet();

      if (presentError) {
        // Usuario canceló o hubo un error
        if (presentError.code === 'Canceled') {
          console.warn('⚠️ [useStripePayment] Usuario canceló el pago');
          // Usuario canceló - no es un error
          setIsLoading(false);
          return false;
        }

        console.error(
          '❌ [useStripePayment] Error al presentar Payment Sheet:',
          presentError.message
        );
        const errorMsg: LangMap = {
          es: 'Error al procesar el pago',
          en: 'Error processing payment',
        };
        setErrorMessage(errorMsg);
        setIsLoading(false);

        Sentry.captureException(
          `STRIPE_PRESENT_ERROR: ${presentError.message ?? 'Unknown'}`
        );
        return false;
      }

      // Pago exitoso
      console.log(
        '✅ [useStripePayment] Pago procesado exitosamente por Stripe'
      );
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMsg: LangMap = {
        es: 'Error inesperado al procesar el pago',
        en: 'Unexpected error processing payment',
      };
      setErrorMessage(errorMsg);
      setIsLoading(false);

      Sentry.captureException(
        `STRIPE_PAYMENT_UNEXPECTED: ${error?.message ?? 'Unknown'}`
      );
      return false;
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
  };
};
