import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useCreateAddress } from '@/hooks/pages/address/useCreateAddress';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { AddressSchemaType } from '@/utils/schemas';

// Mock dependencies
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/lib/error/sentry-error-report');
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {},
}));

const mockSecurePost = jest.fn();

describe('useCreateAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSecureApi as jest.Mock).mockReturnValue({
      securePost: mockSecurePost,
    });
  });

  const mockAddressData: AddressSchemaType = {
    nameAddress: 'Home',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'US',
    postalCode: '10001',
    primaryAddress: true,
  };

  it('should create address successfully', async () => {
    mockSecurePost.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const { result } = renderHook(() => useCreateAddress());

    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();

    await act(async () => {
      await result.current.createAddress(mockAddressData);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.errorMessage).toBeNull();
    expect(mockSecurePost).toHaveBeenCalledWith({
      endpoint: expect.any(String),
      data: mockAddressData,
    });
  });

  it('should handle API error when creating address', async () => {
    const mockError = {
      en: 'Invalid address data',
      es: 'Datos de dirección inválidos',
    };

    mockSecurePost.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useCreateAddress());

    await act(async () => {
      await result.current.createAddress(mockAddressData);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(mockError);
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecurePost.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCreateAddress());

    await act(async () => {
      await result.current.createAddress(mockAddressData);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error creating address',
      es: 'Error al crear la dirección',
    });
  });

  it('should update status to loading during creation', async () => {
    mockSecurePost.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: { success: true },
                error: null,
              }),
            100
          );
        })
    );

    const { result } = renderHook(() => useCreateAddress());

    expect(result.current.status).toBe('idle');

    const responsePromise = result.current.createAddress(mockAddressData);

    // Should be loading immediately after calling createAddress
    await waitFor(() => {
      expect(result.current.status).toBe('loading');
    });

    await responsePromise;

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });

  it('should allow creating multiple addresses sequentially', async () => {
    mockSecurePost
      .mockResolvedValueOnce({
        data: { success: true },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

    const { result } = renderHook(() => useCreateAddress());

    await act(async () => {
      await result.current.createAddress(mockAddressData);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    const secondAddressData: AddressSchemaType = {
      ...mockAddressData,
      nameAddress: 'Work',
      primaryAddress: false,
    };

    await act(async () => {
      await result.current.createAddress(secondAddressData);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(mockSecurePost).toHaveBeenCalledTimes(2);
  });
});
