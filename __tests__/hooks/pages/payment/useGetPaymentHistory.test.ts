import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useGetPaymentHistory } from '@/hooks/pages/payment/useGetPaymentHistory';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { UserPayment } from '@/types/types';

// Mock dependencies
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/lib/error/sentry-error-report');
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {},
}));

const mockSecureGet = jest.fn();

describe('useGetPaymentHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSecureApi as jest.Mock).mockReturnValue({
      secureGet: mockSecureGet,
    });
  });

  const mockPayments: UserPayment[] = [
    {
      id: 1,
      createdAt: '2025-10-08T06:43:00Z',
      status: 'APPROVED',
      totalAmount: 235.0,
      articlesPaid: [1],
      auction: null,
      articles: [
        {
          id: 1,
          title: 'Elegant Black Handbag',
          auctionId: 0,
          soldPrice: 235.0,
          brand: 'Prada',
          images: ['https://example.com/image.jpg'],
        },
      ],
      user: {},
    },
    {
      id: 2,
      createdAt: '2025-05-26T04:58:00Z',
      status: 'APPROVED',
      totalAmount: 10094.5,
      articlesPaid: [2],
      auction: {
        id: 5,
        title: 'April auction',
        startDate: new Date('2025-04-15'),
      },
      articles: [
        {
          id: 2,
          title: 'Louis Vuitton Handbag',
          auctionId: 5,
          soldPrice: 10094.5,
          brand: 'Louis Vuitton',
          images: ['https://example.com/lv.jpg'],
        },
      ],
      user: {},
    },
  ];

  it('should fetch payments successfully', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: mockPayments,
      error: undefined,
    });

    const { result } = renderHook(() => useGetPaymentHistory());

    // Wait for loading to complete (hook fetches immediately)
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual(mockPayments);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should handle API error', async () => {
    const mockError = {
      en: 'Error loading payment history',
      es: 'Error al cargar el historial de pagos',
    };

    mockSecureGet.mockResolvedValueOnce({
      data: undefined,
      error: mockError,
    });

    const { result } = renderHook(() => useGetPaymentHistory());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toEqual(mockError);
  });

  it('should handle empty array response', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: [],
      error: undefined,
    });

    const { result } = renderHook(() => useGetPaymentHistory());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should allow refetching payments', async () => {
    mockSecureGet
      .mockResolvedValueOnce({
        data: [mockPayments[0]],
        error: undefined,
      })
      .mockResolvedValueOnce({
        data: mockPayments,
        error: undefined,
      });

    const { result } = renderHook(() => useGetPaymentHistory());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([mockPayments[0]]);

    // Refetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockPayments);
    });

    expect(mockSecureGet).toHaveBeenCalledTimes(2);
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecureGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGetPaymentHistory());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error loading payment history',
      es: 'Error al cargar el historial de pagos',
    });
  });

  it('should update status to loading during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockSecureGet.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useGetPaymentHistory());

    // Should start as idle, then loading
    await waitFor(() => {
      expect(result.current.status).toBe('loading');
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        data: mockPayments,
        error: undefined,
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });

  it('should handle null data response', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: undefined,
    });

    const { result } = renderHook(() => useGetPaymentHistory());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([]);
  });

  it('should call secure endpoint with correct parameters', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: mockPayments,
      error: undefined,
    });

    renderHook(() => useGetPaymentHistory());

    await waitFor(() => {
      expect(mockSecureGet).toHaveBeenCalledWith({
        endpoint: '/user/payment-history',
      });
    });
  });
});
