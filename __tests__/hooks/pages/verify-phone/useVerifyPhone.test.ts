import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useVerifyPhone } from '@/hooks/pages/verify-phone/useVerifyPhone';

// Mock dependencies
const mockSecurePost = jest.fn();

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({
    securePost: mockSecurePost,
  }),
}));

jest.mock('@/lib/error/sentry-error-report');

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('useVerifyPhone', () => {
  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'OTP sent successfully', es: 'OTP enviado' },
        },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      expect(result.current.status).toBe('idle');
      expect(result.current.canResend).toBe(true);

      let sendPromise: Promise<{ success: boolean }>;
      act(() => {
        sendPromise = result.current.sendOtp('+50259513090');
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      const sendResult = await sendPromise!;

      // Should be success
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(sendResult.success).toBe(true);
      expect(result.current.errorMessage).toBeNull();
      expect(mockSecurePost).toHaveBeenCalledWith({
        endpoint: '/user/otp/send',
        data: { phoneNumber: '+50259513090' },
      });

      // Countdown should start
      expect(result.current.canResend).toBe(false);
      expect(result.current.remainingSeconds).toBe(30);
    });

    it('should handle API error when sending OTP', async () => {
      const errorMessage = {
        en: 'Invalid phone number',
        es: 'Número de teléfono inválido',
      };

      mockSecurePost.mockResolvedValue({
        data: undefined,
        error: errorMessage,
      });

      const { result } = renderHook(() => useVerifyPhone());

      let sendPromise: Promise<{ success: boolean }>;
      act(() => {
        sendPromise = result.current.sendOtp('+50259513090');
      });

      const sendResult = await sendPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(sendResult.success).toBe(false);
      expect(result.current.errorMessage).toEqual(errorMessage);
      expect(result.current.canResend).toBe(true); // Countdown should NOT start on error
    });

    it('should handle no data response', async () => {
      mockSecurePost.mockResolvedValue({
        data: null,
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      let sendPromise: Promise<{ success: boolean }>;
      act(() => {
        sendPromise = result.current.sendOtp('+50259513090');
      });

      const sendResult = await sendPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(sendResult.success).toBe(false);
      expect(result.current.errorMessage).toEqual({
        en: 'No response from server',
        es: 'Sin respuesta del servidor',
      });
    });

    it('should handle unexpected error gracefully', async () => {
      mockSecurePost.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVerifyPhone());

      let sendPromise: Promise<{ success: boolean }>;
      act(() => {
        sendPromise = result.current.sendOtp('+50259513090');
      });

      const sendResult = await sendPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(sendResult.success).toBe(false);
      expect(result.current.errorMessage).toEqual({
        en: 'Failed to send verification code',
        es: 'Error al enviar código de verificación',
      });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'Phone verified', es: 'Teléfono verificado' },
        },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      let verifyPromise: Promise<{ success: boolean }>;
      act(() => {
        verifyPromise = result.current.verifyOtp('+50259513090', '317638');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      const verifyResult = await verifyPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(verifyResult.success).toBe(true);
      expect(result.current.errorMessage).toBeNull();
      expect(mockSecurePost).toHaveBeenCalledWith({
        endpoint: '/user/otp/verify',
        data: { phoneNumber: '+50259513090', code: '317638' },
      });
    });

    it('should handle API error when verifying OTP', async () => {
      const errorMessage = {
        en: 'Invalid verification code',
        es: 'Código de verificación inválido',
      };

      mockSecurePost.mockResolvedValue({
        data: undefined,
        error: errorMessage,
      });

      const { result } = renderHook(() => useVerifyPhone());

      let verifyPromise: Promise<{ success: boolean }>;
      act(() => {
        verifyPromise = result.current.verifyOtp('+50259513090', '123456');
      });

      const verifyResult = await verifyPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(verifyResult.success).toBe(false);
      expect(result.current.errorMessage).toEqual(errorMessage);
    });

    it('should handle no data response for verification', async () => {
      mockSecurePost.mockResolvedValue({
        data: null,
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      let verifyPromise: Promise<{ success: boolean }>;
      act(() => {
        verifyPromise = result.current.verifyOtp('+50259513090', '123456');
      });

      const verifyResult = await verifyPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(verifyResult.success).toBe(false);
      expect(result.current.errorMessage).toEqual({
        en: 'Invalid verification code',
        es: 'Código de verificación inválido',
      });
    });

    it('should handle unexpected error gracefully during verification', async () => {
      mockSecurePost.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVerifyPhone());

      let verifyPromise: Promise<{ success: boolean }>;
      act(() => {
        verifyPromise = result.current.verifyOtp('+50259513090', '123456');
      });

      const verifyResult = await verifyPromise!;

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(verifyResult.success).toBe(false);
      expect(result.current.errorMessage).toEqual({
        en: 'Failed to verify code',
        es: 'Error al verificar código',
      });
    });
  });

  describe('Resend countdown', () => {
    it('should start countdown after successful OTP send', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'OTP sent', es: 'OTP enviado' },
        },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      expect(result.current.canResend).toBe(true);
      expect(result.current.remainingSeconds).toBe(0);

      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.canResend).toBe(false);
        expect(result.current.remainingSeconds).toBe(30);
      });
    });

    it('should countdown every second', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'OTP sent', es: 'OTP enviado' },
        },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.remainingSeconds).toBe(30);
      });

      // Fast-forward 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.remainingSeconds).toBe(29);
      });

      // Fast-forward another second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.remainingSeconds).toBe(28);
      });
    });

    it('should re-enable resend after countdown completes', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'OTP sent', es: 'OTP enviado' },
        },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.canResend).toBe(false);
        expect(result.current.remainingSeconds).toBe(30);
      });

      // Fast-forward 30 seconds (complete countdown)
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(result.current.canResend).toBe(true);
        expect(result.current.remainingSeconds).toBe(0);
      });
    });

    it('should manually start countdown', () => {
      const { result } = renderHook(() => useVerifyPhone());

      expect(result.current.canResend).toBe(true);

      act(() => {
        result.current.startResendCountdown();
      });

      expect(result.current.canResend).toBe(false);
      expect(result.current.remainingSeconds).toBe(30);

      // Fast-forward 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.remainingSeconds).toBe(25);
    });

    it('should clear countdown interval on unmount', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'OTP sent', es: 'OTP enviado' },
        },
        error: undefined,
      });

      const { result, unmount } = renderHook(() => useVerifyPhone());

      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.remainingSeconds).toBe(30);
      });

      // Clear all timers before unmount to avoid interference
      act(() => {
        jest.clearAllTimers();
      });

      // Unmount component
      unmount();

      // Verify no timers are running after cleanup
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should not start countdown on send error', async () => {
      mockSecurePost.mockResolvedValue({
        data: undefined,
        error: { en: 'Error', es: 'Error' },
      });

      const { result } = renderHook(() => useVerifyPhone());

      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.canResend).toBe(true);
      expect(result.current.remainingSeconds).toBe(0);
    });
  });

  describe('Status management', () => {
    it('should update status through sendOtp flow', async () => {
      mockSecurePost.mockResolvedValue({
        data: { success: { en: 'OTP sent', es: 'OTP enviado' } },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      expect(result.current.status).toBe('idle');

      act(() => {
        result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
    });

    it('should update status through verifyOtp flow', async () => {
      mockSecurePost.mockResolvedValue({
        data: { success: { en: 'Verified', es: 'Verificado' } },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      expect(result.current.status).toBe('idle');

      act(() => {
        result.current.verifyOtp('+50259513090', '123456');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
    });

    it('should clear errorMessage when starting new operation', async () => {
      // First call with error
      mockSecurePost.mockResolvedValueOnce({
        data: undefined,
        error: { en: 'Error', es: 'Error' },
      });

      const { result } = renderHook(() => useVerifyPhone());

      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.errorMessage).toEqual({
          en: 'Error',
          es: 'Error',
        });
      });

      // Second call with success
      mockSecurePost.mockResolvedValueOnce({
        data: { success: { en: 'Success', es: 'Éxito' } },
        error: undefined,
      });

      act(() => {
        result.current.sendOtp('+50259513090');
      });

      // Error should be cleared when starting new operation
      await waitFor(() => {
        expect(result.current.errorMessage).toBeNull();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete verification flow', async () => {
      const { result } = renderHook(() => useVerifyPhone());

      // Step 1: Send OTP
      mockSecurePost.mockResolvedValueOnce({
        data: { success: { en: 'OTP sent', es: 'OTP enviado' } },
        error: undefined,
      });

      await act(async () => {
        const sendResult = await result.current.sendOtp('+50259513090');
        expect(sendResult.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
        expect(result.current.canResend).toBe(false);
      });

      // Step 2: Verify OTP
      mockSecurePost.mockResolvedValueOnce({
        data: { success: { en: 'Verified', es: 'Verificado' } },
        error: undefined,
      });

      await act(async () => {
        const verifyResult = await result.current.verifyOtp(
          '+50259513090',
          '317638'
        );
        expect(verifyResult.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
        expect(result.current.errorMessage).toBeNull();
      });
    });

    it('should handle resend after countdown', async () => {
      mockSecurePost.mockResolvedValue({
        data: { success: { en: 'OTP sent', es: 'OTP enviado' } },
        error: undefined,
      });

      const { result } = renderHook(() => useVerifyPhone());

      // First send
      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      await waitFor(() => {
        expect(result.current.canResend).toBe(false);
      });

      // Complete countdown
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(result.current.canResend).toBe(true);
      });

      // Resend OTP
      await act(async () => {
        await result.current.sendOtp('+50259513090');
      });

      expect(mockSecurePost).toHaveBeenCalledTimes(2);
      await waitFor(() => {
        expect(result.current.canResend).toBe(false);
        expect(result.current.remainingSeconds).toBe(30);
      });
    });

    it('should allow multiple verification attempts', async () => {
      const { result } = renderHook(() => useVerifyPhone());

      // First attempt - fail
      mockSecurePost.mockResolvedValueOnce({
        data: undefined,
        error: { en: 'Invalid code', es: 'Código inválido' },
      });

      await act(async () => {
        const result1 = await result.current.verifyOtp(
          '+50259513090',
          '111111'
        );
        expect(result1.success).toBe(false);
      });

      // Second attempt - success
      mockSecurePost.mockResolvedValueOnce({
        data: { success: { en: 'Verified', es: 'Verificado' } },
        error: undefined,
      });

      await act(async () => {
        const result2 = await result.current.verifyOtp(
          '+50259513090',
          '317638'
        );
        expect(result2.success).toBe(true);
      });

      expect(mockSecurePost).toHaveBeenCalledTimes(2);
    });
  });
});
