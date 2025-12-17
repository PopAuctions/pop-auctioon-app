import { renderHook, act } from '@testing-library/react-native';
import { useRejectArticlesPayment } from '@/hooks/pages/payment/useRejectArticlesPayment';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';

jest.mock(
  '@/utils/supabase/supabase-store',
  () => require('@/__tests__/setup/mocks.mock').mockSupabase
);
jest.mock('@/hooks/api/useSecureApi');

const mockSecurePost = jest.fn();
const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;

describe('useRejectArticlesPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSecureApi.mockReturnValue({
      secureGet: jest.fn(),
      securePost: mockSecurePost,
      protectedGet: jest.fn(),
      protectedPost: jest.fn(),
    });
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useRejectArticlesPayment());

    expect(result.current.status).toBe(REQUEST_STATUS.idle);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should reject payment successfully with error details', async () => {
    mockSecurePost.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const { result } = renderHook(() => useRejectArticlesPayment());

    let result2: any = null;

    await act(async () => {
      result2 = await result.current.rejectPayment({
        userPaymentId: 123,
        errorCode: 'payment_failed',
        errorDescription: 'Card declined by bank',
      });
    });

    expect(result2.success).toBe(true);
    expect(result2.error).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.success);
    expect(result.current.errorMessage).toBeNull();

    expect(mockSecurePost).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.PAYMENT.REJECT_ARTICLES_PAYMENT,
      data: {
        userPaymentId: 123,
        errorCode: 'payment_failed',
        errorDescription: 'Card declined by bank',
      },
    });
  });

  it('should reject payment successfully without error details', async () => {
    mockSecurePost.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const { result } = renderHook(() => useRejectArticlesPayment());

    let result2: any = null;

    await act(async () => {
      result2 = await result.current.rejectPayment({
        userPaymentId: 456,
      });
    });

    expect(result2.success).toBe(true);
    expect(result2.error).toBeNull();
    expect(mockSecurePost).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.PAYMENT.REJECT_ARTICLES_PAYMENT,
      data: {
        userPaymentId: 456,
        errorCode: undefined,
        errorDescription: undefined,
      },
    });
  });

  it('should handle API error response', async () => {
    const mockError = {
      es: 'Error al rechazar pago',
      en: 'Error rejecting payment',
    };

    mockSecurePost.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useRejectArticlesPayment());

    let result2: any = null;

    await act(async () => {
      result2 = await result.current.rejectPayment({
        userPaymentId: 123,
      });
    });

    expect(result2.success).toBe(false);
    expect(result2.error).toEqual(mockError);
    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.errorMessage).toEqual(mockError);
  });

  it('should handle network/unexpected errors', async () => {
    mockSecurePost.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRejectArticlesPayment());

    let result2: any = null;

    await act(async () => {
      result2 = await result.current.rejectPayment({
        userPaymentId: 123,
        errorCode: 'timeout',
        errorDescription: 'Request timeout',
      });
    });

    expect(result2.success).toBe(false);
    expect(result2.error).toEqual({
      es: 'Error al revertir el pago',
      en: 'Error reverting payment',
    });
  });

  it('should clear previous error messages on new reject attempt', async () => {
    // First call - error
    mockSecurePost.mockResolvedValueOnce({
      data: null,
      error: { es: 'Error', en: 'Error' },
    });

    const { result } = renderHook(() => useRejectArticlesPayment());

    await act(async () => {
      await result.current.rejectPayment({ userPaymentId: 1 });
    });

    expect(result.current.errorMessage).toBeTruthy();

    // Second call - success
    mockSecurePost.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    await act(async () => {
      await result.current.rejectPayment({ userPaymentId: 2 });
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.success);
  });
});
