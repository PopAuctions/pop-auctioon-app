import { renderHook, waitFor } from '@testing-library/react-native';
import {
  useGetBilling,
  useCreateBilling,
  useUpdateBilling,
  useDeleteBilling,
} from '@/hooks/pages/billing/useBilling';
import type { UserBillingInfo } from '@/types/types';

// Mock dependencies
const mockSecureGet = jest.fn();
const mockSecurePost = jest.fn();
const mockSecurePatch = jest.fn();
const mockSecureDelete = jest.fn();

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({
    secureGet: mockSecureGet,
    securePost: mockSecurePost,
    securePatch: mockSecurePatch,
    secureDelete: mockSecureDelete,
  }),
}));

jest.mock('@/lib/error/sentry-error-report');

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
});
describe('useGetBilling', () => {
  const mockBillingData: UserBillingInfo[] = [
    {
      id: '1',
      label: 'Home',
      billingName: 'John Doe',
      billingAddress: '123 Main St',
      vatNumber: 'VAT123',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      label: 'Office',
      billingName: 'Company Inc',
      billingAddress: '456 Business Ave',
      vatNumber: 'VAT456',
      userId: 'user-1',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  it('should fetch billing data successfully on mount', async () => {
    mockSecureGet.mockResolvedValue({
      data: mockBillingData,
      error: undefined,
      status: 200,
    });

    const { result } = renderHook(() => useGetBilling());

    // Initial state should be loading
    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual(mockBillingData);
    expect(result.current.errorMessage).toBeNull();
    expect(mockSecureGet).toHaveBeenCalledTimes(1);
  });

  it('should handle API error', async () => {
    const errorMessage = {
      en: 'Error loading billing',
      es: 'Error al cargar facturación',
    };

    mockSecureGet.mockResolvedValue({
      data: undefined,
      error: errorMessage,
      status: 400,
    });

    const { result } = renderHook(() => useGetBilling());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(errorMessage);
    expect(result.current.data).toEqual([]);
  });

  it('should handle empty array response', async () => {
    mockSecureGet.mockResolvedValue({
      data: [],
      error: undefined,
      status: 200,
    });

    const { result } = renderHook(() => useGetBilling());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual([]);
  });

  it('should allow refetching billing data', async () => {
    mockSecureGet.mockResolvedValue({
      data: mockBillingData,
      error: undefined,
      status: 200,
    });

    const { result } = renderHook(() => useGetBilling());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(mockSecureGet).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecureGet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGetBilling());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error loading billing information',
      es: 'Error al cargar la información de facturación',
    });
  });
});

describe('useCreateBilling', () => {
  const mockBillingData = {
    label: 'New Billing',
    billingName: 'Jane Smith',
    billingAddress: '789 New St',
    vatNumber: 'VAT789',
  };

  it('should create billing successfully', async () => {
    mockSecurePost.mockResolvedValue({
      data: { ...mockBillingData, id: '3' },
      error: undefined,
      status: 200,
    });

    const { result } = renderHook(() => useCreateBilling());

    expect(result.current.status).toBe('idle');

    await result.current.createBilling(mockBillingData);

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(mockSecurePost).toHaveBeenCalledWith({
      endpoint: '/user/billing',
      data: mockBillingData,
    });
  });

  it('should handle API error when creating billing', async () => {
    const errorMessage = {
      en: 'Invalid billing data',
      es: 'Datos de facturación inválidos',
    };

    mockSecurePost.mockResolvedValue({
      data: undefined,
      error: errorMessage,
      status: 400,
    });

    const { result } = renderHook(() => useCreateBilling());

    await result.current.createBilling(mockBillingData);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(errorMessage);
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecurePost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateBilling());

    await result.current.createBilling(mockBillingData);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error creating billing information',
      es: 'Error al crear la información de facturación',
    });
  });
});

describe('useUpdateBilling', () => {
  const billingId = '1';
  const mockUpdateData = {
    label: 'Updated Billing',
    billingName: 'Updated Name',
    billingAddress: 'Updated Address',
    vatNumber: 'VATUPD',
  };

  it('should update billing successfully', async () => {
    mockSecurePatch.mockResolvedValue({
      data: { ...mockUpdateData, id: billingId },
      error: undefined,
      status: 200,
    });

    const { result } = renderHook(() => useUpdateBilling());

    expect(result.current.status).toBe('idle');

    await result.current.updateBilling(billingId, mockUpdateData);

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(mockSecurePatch).toHaveBeenCalledWith({
      endpoint: `/user/billing/${billingId}`,
      data: mockUpdateData,
    });
  });

  it('should handle API error when updating billing', async () => {
    const errorMessage = {
      en: 'Failed to update billing',
      es: 'Error al actualizar facturación',
    };

    mockSecurePatch.mockResolvedValue({
      data: undefined,
      error: errorMessage,
      status: 400,
    });

    const { result } = renderHook(() => useUpdateBilling());

    await result.current.updateBilling(billingId, mockUpdateData);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(errorMessage);
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecurePatch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpdateBilling());

    await result.current.updateBilling(billingId, mockUpdateData);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error updating billing information',
      es: 'Error al actualizar la información de facturación',
    });
  });
});

describe('useDeleteBilling', () => {
  const billingId = '1';

  it('should delete billing successfully', async () => {
    mockSecureDelete.mockResolvedValue({
      data: { success: true },
      error: undefined,
      status: 200,
    });

    const { result } = renderHook(() => useDeleteBilling());

    expect(result.current.status).toBe('idle');

    await result.current.deleteBilling(billingId);

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(mockSecureDelete).toHaveBeenCalledWith({
      endpoint: `/user/billing/${billingId}`,
    });
  });

  it('should handle API error when deleting billing', async () => {
    const errorMessage = {
      en: 'Failed to delete billing',
      es: 'Error al eliminar facturación',
    };

    mockSecureDelete.mockResolvedValue({
      data: undefined,
      error: errorMessage,
      status: 400,
    });

    const { result } = renderHook(() => useDeleteBilling());

    await result.current.deleteBilling(billingId);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(errorMessage);
  });

  it('should handle unexpected error gracefully', async () => {
    mockSecureDelete.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDeleteBilling());

    await result.current.deleteBilling(billingId);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error deleting billing information',
      es: 'Error al eliminar la información de facturación',
    });
  });
});
