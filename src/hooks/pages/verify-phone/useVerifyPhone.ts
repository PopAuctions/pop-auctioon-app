import { useState, useCallback, useRef, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';

interface UseVerifyPhoneReturn {
  // Actions
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean }>;
  verifyOtp: (
    phoneNumber: string,
    code: string
  ) => Promise<{ success: boolean }>;

  // Single status for all operations
  status: RequestStatus;
  errorMessage: MessageKey | null;

  // Resend countdown
  canResend: boolean;
  remainingSeconds: number;
  startResendCountdown: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_NO_RESPONSE_ERROR =
  'errors.otp.noResponse' as const satisfies MessageKey;
const OTP_SEND_FAILED_ERROR =
  'errors.otp.sendFailed' as const satisfies MessageKey;
const OTP_INVALID_VERIFICATION_CODE_ERROR =
  'errors.otp.invalidVerificationCode' as const satisfies MessageKey;
const OTP_VERIFY_FAILED_ERROR =
  'errors.otp.verifyFailed' as const satisfies MessageKey;

export const useVerifyPhone = (): UseVerifyPhoneReturn => {
  const { securePost } = useSecureApi();

  // Single status for all operations (like useBilling)
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);

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
          setErrorMessage(response.messageCode ?? OTP_SEND_FAILED_ERROR);
          return { success: false };
        }

        if (response.data) {
          setStatus('success');
          startResendCountdown(); // Start countdown after successful send
          return { success: true };
        }

        // No data received
        setStatus('error');
        setErrorMessage(OTP_NO_RESPONSE_ERROR);
        return { success: false };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error occurred';

        sentryErrorReport(
          errorMsg,
          'USE_VERIFY_PHONE - Unexpected error sending OTP'
        );

        setStatus('error');
        setErrorMessage(OTP_SEND_FAILED_ERROR);
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
          setErrorMessage(response.messageCode ?? OTP_VERIFY_FAILED_ERROR);
          return { success: false };
        }

        if (response.data) {
          setStatus('success');
          return { success: true };
        }

        // No data received
        setStatus('error');
        setErrorMessage(OTP_INVALID_VERIFICATION_CODE_ERROR);
        return { success: false };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error occurred';

        sentryErrorReport(
          errorMsg,
          'USE_VERIFY_PHONE - Unexpected error verifying OTP'
        );

        setStatus('error');
        setErrorMessage(OTP_VERIFY_FAILED_ERROR);
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
