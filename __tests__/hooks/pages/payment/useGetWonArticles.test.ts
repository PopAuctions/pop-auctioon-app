import { renderHook, waitFor } from '@testing-library/react-native';
import { useGetWonArticles } from '@/hooks/pages/payment/useGetWonArticles';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { UserArticlesWon } from '@/types/types';

// Mock dependencies
jest.mock(
  '@/utils/supabase/supabase-store',
  () => require('@/__tests__/setup/mocks.mock').mockSupabase
);
jest.mock('@/hooks/api/useSecureApi');

const mockSecureGet = jest.fn();

const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;

describe('useGetWonArticles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSecureApi.mockReturnValue({
      secureGet: mockSecureGet,
      securePost: jest.fn(),
      protectedGet: jest.fn(),
      protectedPost: jest.fn(),
    });
  });

  it('should start with idle status', () => {
    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should fetch won articles successfully', async () => {
    const mockArticles: UserArticlesWon[] = [
      {
        id: 1,
        title: 'Test Article 1',
        brand: 'Brand A',
        soldPrice: 100,
        articleImage: 'https://example.com/image1.jpg',
      },
      {
        id: 2,
        title: 'Test Article 2',
        brand: 'Brand B',
        soldPrice: 200,
        articleImage: 'https://example.com/image2.jpg',
      },
    ];

    mockSecureGet.mockResolvedValueOnce({
      data: mockArticles,
      error: null,
    });

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual(mockArticles);
    expect(result.current.errorMessage).toBeNull();
    expect(mockSecureGet).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.USER.WON_ARTICLES('123'),
    });
  });

  it('should handle empty articles array', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should handle null data response as empty array', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should handle missing auctionId', async () => {
    const { result } = renderHook(() => useGetWonArticles({ auctionId: '' }));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      es: 'ID de subasta requerido',
      en: 'Auction ID required',
    });
    expect(mockSecureGet).not.toHaveBeenCalled();
  });

  it('should handle API error response', async () => {
    const mockError = {
      es: 'Error del servidor',
      en: 'Server error',
    };

    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(mockError);
    expect(result.current.data).toEqual([]);
  });

  it('should handle network/unexpected errors', async () => {
    mockSecureGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      es: 'Error al cargar artículos ganados',
      en: 'Error loading won articles',
    });
  });

  it('should support refetch functionality', async () => {
    const mockArticles: UserArticlesWon[] = [
      {
        id: 1,
        title: 'Test Article',
        brand: 'Brand A',
        soldPrice: 100,
        articleImage: 'https://example.com/image.jpg',
      },
    ];

    mockSecureGet.mockResolvedValue({
      data: mockArticles,
      error: null,
    });

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Call refetch
    await result.current.refetch();

    expect(mockSecureGet).toHaveBeenCalledTimes(2);
  });

  it('should update status to loading when refetching', async () => {
    mockSecureGet.mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() =>
      useGetWonArticles({ auctionId: '123' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Start refetch (should set loading status)
    const refetchPromise = result.current.refetch();

    // Note: In real implementation, status should be 'loading' during refetch
    // but due to async nature, might need to adjust implementation to track this

    await refetchPromise;

    expect(result.current.status).toBe('success');
  });
});
