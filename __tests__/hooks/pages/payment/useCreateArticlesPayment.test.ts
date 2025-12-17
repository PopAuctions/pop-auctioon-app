import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCreateArticlesPayment } from '@/hooks/pages/payment/useCreateArticlesPayment';
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

describe('useCreateArticlesPayment', () => {
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
    const { result } = renderHook(() => useCreateArticlesPayment());

    expect(result.current.status).toBe(REQUEST_STATUS.idle);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should create payment successfully', async () => {
    const mockResponse = {
      data: { userPaymentId: 42 },
      error: null,
    };

    mockSecurePost.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreateArticlesPayment());

    let paymentId: number | null = null;

    await act(async () => {
      paymentId = await result.current.createPayment({
        auctionId: '123',
        articlesIds: [1, 2, 3],
        clientTotalAmount: 1000,
        clientIntent: 'pi_test_123',
        country: 'SPAIN',
        userAddressId: '456',
        discount: { code: 'SUMMER20', amount: 50 },
      });
    });

    expect(paymentId).toBe(42);
    expect(result.current.status).toBe(REQUEST_STATUS.success);
    expect(result.current.errorMessage).toBeNull();

    expect(mockSecurePost).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_ARTICLES_PAYMENT,
      data: {
        auctionId: '123',
        articlesIds: [1, 2, 3],
        clientTotalAmount: 1000,
        clientIntent: 'pi_test_123',
        country: 'SPAIN',
        userAddressId: '456',
        discount: { code: 'SUMMER20', amount: 50 },
      },
    });
  });

  it('should handle payment creation without discount', async () => {
    const mockResponse = {
      data: { userPaymentId: 100 },
      error: null,
    };

    mockSecurePost.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreateArticlesPayment());

    let paymentId: number | null = null;

    await act(async () => {
      paymentId = await result.current.createPayment({
        auctionId: '123',
        articlesIds: [1],
        clientTotalAmount: 500,
        clientIntent: 'pi_test_456',
        country: 'FRANCE',
        userAddressId: '789',
        discount: null,
      });
    });

    expect(paymentId).toBe(100);
    expect(mockSecurePost).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_ARTICLES_PAYMENT,
      data: {
        auctionId: '123',
        articlesIds: [1],
        clientTotalAmount: 500,
        clientIntent: 'pi_test_456',
        country: 'FRANCE',
        userAddressId: '789',
        discount: null,
      },
    });
  });

  it('should handle API error response', async () => {
    const mockError = {
      es: 'Error al crear pago',
      en: 'Error creating payment',
    };

    mockSecurePost.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useCreateArticlesPayment());

    let paymentId: number | null = null;

    await act(async () => {
      paymentId = await result.current.createPayment({
        auctionId: '123',
        articlesIds: [1],
        clientTotalAmount: 500,
        clientIntent: 'pi_test',
        country: 'SPAIN',
        userAddressId: '1',
        discount: null,
      });
    });

    expect(paymentId).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.errorMessage).toEqual(mockError);
  });

  it('should handle missing userPaymentId in response', async () => {
    mockSecurePost.mockResolvedValueOnce({
      data: {}, // No userPaymentId
      error: null,
    });

    const { result } = renderHook(() => useCreateArticlesPayment());

    let paymentId: number | null = null;

    await act(async () => {
      paymentId = await result.current.createPayment({
        auctionId: '123',
        articlesIds: [1],
        clientTotalAmount: 500,
        clientIntent: 'pi_test',
        country: 'SPAIN',
        userAddressId: '1',
        discount: null,
      });
    });

    expect(paymentId).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.errorMessage).toEqual({
      es: 'No se recibió el ID del pago',
      en: 'Payment ID not received',
    });
  });

  it('should handle network/unexpected errors', async () => {
    mockSecurePost.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCreateArticlesPayment());

    let paymentId: number | null = null;

    await act(async () => {
      paymentId = await result.current.createPayment({
        auctionId: '123',
        articlesIds: [1],
        clientTotalAmount: 500,
        clientIntent: 'pi_test',
        country: 'SPAIN',
        userAddressId: '1',
        discount: null,
      });
    });

    expect(paymentId).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.errorMessage).toEqual({
      es: 'Error inesperado al crear pago',
      en: 'Unexpected error creating payment',
    });
  });

  it('should set status to loading during payment creation', async () => {
    mockSecurePost.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { userPaymentId: 1 }, error: null });
          }, 100);
        })
    );

    const { result } = renderHook(() => useCreateArticlesPayment());

    const createPromise = act(async () => {
      return result.current.createPayment({
        auctionId: '123',
        articlesIds: [1],
        clientTotalAmount: 500,
        clientIntent: 'pi_test',
        country: 'SPAIN',
        userAddressId: '1',
        discount: null,
      });
    });

    // Should be loading
    await waitFor(() => {
      expect(result.current.status).toBe(REQUEST_STATUS.loading);
    });

    await createPromise;

    expect(result.current.status).toBe(REQUEST_STATUS.success);
  });
});
