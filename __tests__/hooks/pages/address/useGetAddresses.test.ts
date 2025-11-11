import { renderHook, waitFor } from '@testing-library/react-native';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { UserAddress } from '@/types/types';

// Mock dependencies
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/lib/error/sentry-error-report');
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {},
}));

const mockSecureGet = jest.fn();

describe('useGetAddresses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSecureApi as jest.Mock).mockReturnValue({
      secureGet: mockSecureGet,
    });
  });

  it('should return addresses successfully', async () => {
    const mockAddresses: UserAddress[] = [
      {
        id: '1',
        userId: 'user-1',
        nameAddress: 'Home',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
        primaryAddress: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockSecureGet.mockResolvedValueOnce({
      data: mockAddresses,
      error: null,
    });

    const { result } = renderHook(() => useGetAddresses());

    // Wait for loading to complete (hook fetches immediately)
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual(mockAddresses);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should handle API error', async () => {
    const mockError = {
      en: 'Error loading addresses',
      es: 'Error al cargar las direcciones',
    };

    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useGetAddresses());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toEqual(mockError);
  });

  it('should handle empty array response', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useGetAddresses());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should allow refetching addresses', async () => {
    const mockAddresses: UserAddress[] = [
      {
        id: '1',
        userId: 'user-1',
        nameAddress: 'Home',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
        primaryAddress: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockSecureGet.mockResolvedValueOnce({
      data: mockAddresses,
      error: null,
    });

    const { result } = renderHook(() => useGetAddresses());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Prepare new data for refetch
    const updatedAddresses: UserAddress[] = [
      ...mockAddresses,
      {
        id: '2',
        userId: 'user-1',
        nameAddress: 'Work',
        address: '456 Office Blvd',
        city: 'Los Angeles',
        state: 'CA',
        country: 'US',
        postalCode: '90001',
        primaryAddress: false,
        created_at: '2024-01-02T00:00:00Z',
      },
    ];

    mockSecureGet.mockResolvedValueOnce({
      data: updatedAddresses,
      error: null,
    });

    // Call refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(updatedAddresses);
    });

    expect(mockSecureGet).toHaveBeenCalledTimes(2);
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecureGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGetAddresses());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.errorMessage).toEqual({
      en: 'Error loading addresses',
      es: 'Error al cargar las direcciones',
    });
  });
});
