import { useCallback, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Sentry from '@sentry/react-native';
import { API_CONFIG, SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';
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
  errorMessage: MessageKey | null;
  clearError: () => void;
  redsysOrderId: string | null;
}

const REDSYS_REDIRECT_URL = 'popauctioonapp://';
const REDSYS_SESSION_CREATE_FAILED =
  'errors.payment.redsysSessionCreateFailed' as const satisfies MessageKey;
const REDSYS_PREPARE_UNEXPECTED =
  'errors.payment.redsysPrepareUnexpected' as const satisfies MessageKey;
const REDSYS_SESSION_NOT_READY =
  'errors.payment.redsysSessionNotReady' as const satisfies MessageKey;
const REDSYS_COMPLETION_FAILED =
  'errors.payment.redsysCompletionFailed' as const satisfies MessageKey;
const REDSYS_GATEWAY_OPEN_FAILED =
  'errors.payment.redsysGatewayOpenFailed' as const satisfies MessageKey;

const buildLaunchUrl = (launchUrl: string): string => {
  if (/^https?:\/\//i.test(launchUrl)) {
    return launchUrl;
  }

  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const normalizedPath = launchUrl.startsWith('/')
    ? launchUrl
    : `/${launchUrl}`;

  if (baseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${baseUrl}${normalizedPath.slice('/api'.length)}`;
  }

  return `${baseUrl}${normalizedPath}`;
};

export const useRedsysPayment = ({
  type,
}: {
  type: string;
}): UseRedsysPaymentReturn => {
  const { securePost } = useSecureApi();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
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
            type,
          },
        });

        if (response.error) {
          setErrorMessage(response.messageCode ?? REDSYS_SESSION_CREATE_FAILED);
          setStatus('error');
          setIsLoading(false);
          return null;
        }

        if (!response.data?.launchUrl || !response.data.redsysOrder) {
          const errorMsg = REDSYS_SESSION_CREATE_FAILED;
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
        const errorMsg = REDSYS_PREPARE_UNEXPECTED;
        setErrorMessage(errorMsg);
        setStatus('error');
        setIsLoading(false);

        Sentry.captureException(
          `REDSYS_SESSION_ERROR: ${error?.message ?? 'Unknown'}`
        );
        return null;
      }
    },
    [securePost, type]
  );

  const openPaymentBrowser = useCallback(async () => {
    if (!launchUrlRef.current) {
      const errorMsg = REDSYS_SESSION_NOT_READY;
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

        setErrorMessage(REDSYS_COMPLETION_FAILED);
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
      const errorMsg = REDSYS_GATEWAY_OPEN_FAILED;
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
