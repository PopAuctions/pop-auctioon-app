import { renderHook, waitFor } from '@testing-library/react-native';
import { useFetchCommission } from '@/hooks/components/useFetchCommission';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';

jest.mock(
  '@/utils/supabase/supabase-store',
  () => require('@/__tests__/setup/mocks.mock').mockSupabase
);
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/lib/error/sentry-error-report');

const mockProtectedGet = jest.fn();
const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;

describe('useFetchCommission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSecureApi.mockReturnValue({
      secureGet: jest.fn(),
      securePost: jest.fn(),
      protectedGet: mockProtectedGet,
      protectedPost: jest.fn(),
    });
  });

  const mockBackendResponse = {
    commission: 12.5,
  };

  describe('Success Cases', () => {
    it('should fetch commission successfully', async () => {
      mockProtectedGet.mockResolvedValue({
        data: mockBackendResponse,
        error: null,
      });

      const { result } = renderHook(() => useFetchCommission());

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toBe(12.5);
      expect(result.current.errorMessage).toBeNull();
      expect(mockProtectedGet).toHaveBeenCalledWith({
        endpoint: PROTECTED_ENDPOINTS.PAYMENT.COMMISSIONS,
      });
    });

    it('should provide refetch function', async () => {
      mockProtectedGet.mockResolvedValue({
        data: mockBackendResponse,
        error: null,
      });

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Error Cases', () => {
    it('should handle API error response', async () => {
      const errorMessage = {
        en: 'Error fetching commission',
        es: 'Error al obtener comisión',
      };

      mockProtectedGet.mockResolvedValue({
        data: null,
        error: errorMessage,
      });

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorMessage).toEqual(errorMessage);
      expect(result.current.data).toBe(0);
    });

    it('should handle missing data', async () => {
      mockProtectedGet.mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorMessage).toEqual({
        en: 'Commission data is missing',
        es: 'Faltan los datos de comisión',
      });
    });

    it('should handle undefined data', async () => {
      mockProtectedGet.mockResolvedValue({
        data: undefined,
        error: null,
      });

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorMessage).toEqual({
        en: 'Commission data is missing',
        es: 'Faltan los datos de comisión',
      });
    });

    it('should handle exception during fetch', async () => {
      mockProtectedGet.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorMessage).toEqual({
        en: 'Error fetching commission data',
        es: 'Error al cargar la comisión',
      });
    });
  });

  describe('Refetch Functionality', () => {
    it('should allow manual refetch', async () => {
      mockProtectedGet
        .mockResolvedValueOnce({
          data: { commission: 10 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { commission: 15 },
          error: null,
        });

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.data).toBe(10);
      });

      result.current.refetch?.();

      await waitFor(() => {
        expect(result.current.data).toBe(15);
      });

      expect(mockProtectedGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Management', () => {
    it('should provide setErrorMessage function', async () => {
      mockProtectedGet.mockResolvedValue({
        data: mockBackendResponse,
        error: null,
      });

      const { result } = renderHook(() => useFetchCommission());

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.setErrorMessage).toBeDefined();
      expect(typeof result.current.setErrorMessage).toBe('function');
    });
  });
});
