import { useState, useCallback, useRef, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { RequestStatus, LangMap } from '@/types/types';

interface UseVerifyPhoneReturn {
  // Actions
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean }>;
  verifyOtp: (
    phoneNumber: string,
    code: string
  ) => Promise<{ success: boolean }>;

  // Single status for all operations
  status: RequestStatus;
  errorMessage: LangMap | null;

  // Resend countdown
  canResend: boolean;
  remainingSeconds: number;
  startResendCountdown: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;

export const useVerifyPhone = (): UseVerifyPhoneReturn => {
  const { securePost } = useSecureApi();

  // Single status for all operations (like useBilling)
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);

  // Resend countdown
  const [canResend, setCanResend] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Clear countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Start resend countdown timer
   */
  const startResendCountdown = useCallback(() => {
    setCanResend(false);
    setRemainingSeconds(RESEND_COOLDOWN_SECONDS);

    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Countdown finished
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Send OTP code to phone number
   */
  const sendOtp = useCallback(
    async (phoneNumber: string): Promise<{ success: boolean }> => {
      try {
        setStatus('loading');
        setErrorMessage(null);

        const response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.OTP.SEND,
          data: { phoneNumber },
        });

        if (response.error) {
          setStatus('error');
          setErrorMessage(response.error);
          return { success: false };
        }

        if (response.data) {
          setStatus('success');
          startResendCountdown(); // Start countdown after successful send
          return { success: true };
        }

        // No data received
        const noDataError = {
          en: 'No response from server',
          es: 'Sin respuesta del servidor',
        };
        setStatus('error');
        setErrorMessage(noDataError);
        return { success: false };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error occurred';

        sentryErrorReport(
          errorMsg,
          'USE_VERIFY_PHONE - Unexpected error sending OTP'
        );

        const catchError = {
          en: 'Failed to send verification code',
          es: 'Error al enviar código de verificación',
        };
        setStatus('error');
        setErrorMessage(catchError);
        return { success: false };
      }
    },
    [securePost, startResendCountdown]
  );

  /**
   * Verify OTP code
   */
  const verifyOtp = useCallback(
    async (
      phoneNumber: string,
      code: string
    ): Promise<{ success: boolean }> => {
      try {
        setStatus('loading');
        setErrorMessage(null);

        const response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.OTP.VERIFY,
          data: { phoneNumber, code },
        });

        if (response.error) {
          setStatus('error');
          setErrorMessage(response.error);
          return { success: false };
        }

        if (response.data) {
          setStatus('success');
          return { success: true };
        }

        // No data received
        const invalidCodeError = {
          en: 'Invalid verification code',
          es: 'Código de verificación inválido',
        };
        setStatus('error');
        setErrorMessage(invalidCodeError);
        return { success: false };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error occurred';

        sentryErrorReport(
          errorMsg,
          'USE_VERIFY_PHONE - Unexpected error verifying OTP'
        );

        const verifyError = {
          en: 'Failed to verify code',
          es: 'Error al verificar código',
        };
        setStatus('error');
        setErrorMessage(verifyError);
        return { success: false };
      }
    },
    [securePost]
  );

  return {
    sendOtp,
    verifyOtp,
    status,
    errorMessage,
    canResend,
    remainingSeconds,
    startResendCountdown,
  };
};
