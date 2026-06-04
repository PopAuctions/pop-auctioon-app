import { useCallback, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Sentry from '@sentry/react-native';
import { API_CONFIG, SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { LangMap, RequestStatus } from '@/types/types';
import {
  parseRedsysReturnUrl,
  type RedsysPaymentBrowserResult,
} from '@/utils/payments/parse-redsys-return-url';

interface CreateRedsysSessionResponse {
  sessionToken: string;
  launchUrl: string;
  redsysOrder: string;
}

interface UseRedsysPaymentReturn {
  initializePaymentSession: (
    amount: number,
    selectedItems: number[]
  ) => Promise<string | null>;
  openPaymentBrowser: () => Promise<RedsysPaymentBrowserResult>;
  isLoading: boolean;
  status: RequestStatus;
  errorMessage: LangMap | null;
  clearError: () => void;
  redsysOrderId: string | null;
}

const REDSYS_REDIRECT_URL = 'popauctioonapp://';

const buildLaunchUrl = (launchUrl: string): string => {
  if (/^https?:\/\//i.test(launchUrl)) {
    return launchUrl;
  }

  return `${API_CONFIG.BASE_URL}${launchUrl.startsWith('/') ? launchUrl : `/${launchUrl}`}`;
};

export const useRedsysPayment = (): UseRedsysPaymentReturn => {
  const { securePost } = useSecureApi();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const launchUrlRef = useRef<string | null>(null);
  const redsysOrderIdRef = useRef<string | null>(null);

  const initializePaymentSession = useCallback(
    async (amount: number, selectedItems: number[]): Promise<string | null> => {
      setIsLoading(true);
      setStatus('loading');
      setErrorMessage(null);

      try {
        const response = await securePost<CreateRedsysSessionResponse>({
          endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_REDSYS_SESSION,
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

        if (!response.data?.launchUrl || !response.data.redsysOrder) {
          const errorMsg: LangMap = {
            es: 'No se pudo crear la sesión de pago',
            en: 'Could not create payment session',
          };
          setErrorMessage(errorMsg);
          setStatus('error');
          setIsLoading(false);
          return null;
        }

        launchUrlRef.current = buildLaunchUrl(response.data.launchUrl);
        redsysOrderIdRef.current = response.data.redsysOrder;
        setStatus('success');
        setIsLoading(false);

        return response.data.redsysOrder;
      } catch (error: any) {
        const errorMsg: LangMap = {
          es: 'Error inesperado al preparar el pago',
          en: 'Unexpected error preparing payment',
        };
        setErrorMessage(errorMsg);
        setStatus('error');
        setIsLoading(false);

        Sentry.captureException(
          `REDSYS_SESSION_ERROR: ${error?.message ?? 'Unknown'}`
        );
        return null;
      }
    },
    [securePost]
  );

  const openPaymentBrowser = useCallback(async () => {
    if (!launchUrlRef.current) {
      const errorMsg: LangMap = {
        es: 'La sesión de pago no está preparada',
        en: 'Payment session is not ready',
      };
      setErrorMessage(errorMsg);
      setStatus('error');

      return {
        success: false,
        type: 'error',
        redsysOrderId: redsysOrderIdRef.current,
        error: {
          code: 'SESSION_NOT_INITIALIZED',
          message: 'Payment session is not initialized',
        },
      } as const;
    }

    setIsLoading(true);
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        launchUrlRef.current,
        REDSYS_REDIRECT_URL
      );

      if (result.type !== 'success' || !('url' in result)) {
        setStatus('idle');
        setIsLoading(false);

        return {
          success: false,
          type: 'cancel',
          redsysOrderId: redsysOrderIdRef.current,
          error: {
            code: 'CANCELED',
            message: 'Payment flow was cancelled by the user',
          },
        } as const;
      }

      const parsedResult = parseRedsysReturnUrl({
        url: result.url,
        expectedOrderId: redsysOrderIdRef.current,
      });

      if (!parsedResult.success) {
        const error =
          parsedResult.type === 'error' && parsedResult.error
            ? parsedResult.error
            : {
                code: 'PAYMENT_CANCELLED',
                message: 'Payment flow was cancelled by the user',
              };

        setErrorMessage({
          es: 'El pago no se pudo completar',
          en: 'Payment could not be completed',
        });
        setStatus('error');

        Sentry.captureException(
          `REDSYS_RETURN_ERROR: ${error.code} - ${error.message}`
        );
      } else {
        setStatus('success');
      }

      setIsLoading(false);
      return parsedResult;
    } catch (error: any) {
      const errorMsg: LangMap = {
        es: 'Error inesperado al abrir la pasarela de pago',
        en: 'Unexpected error opening payment gateway',
      };
      setErrorMessage(errorMsg);
      setStatus('error');
      setIsLoading(false);

      Sentry.captureException(
        `REDSYS_BROWSER_ERROR: ${error?.message ?? 'Unknown'}`
      );

      return {
        success: false,
        type: 'error',
        redsysOrderId: redsysOrderIdRef.current,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: error?.message ?? 'Unknown error',
        },
      } as const;
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    initializePaymentSession,
    openPaymentBrowser,
    isLoading,
    status,
    errorMessage,
    clearError,
    redsysOrderId: redsysOrderIdRef.current,
  };
};
