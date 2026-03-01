import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useUpdateLanguage } from '@/hooks/pages/user/useUpdateLanguage';

// --- mocks ---
const mockSecurePatch = jest.fn();
const mockCallToast = jest.fn();

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({
    securePatch: mockSecurePatch,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    callToast: mockCallToast,
  }),
}));

jest.mock('@/lib/error/sentry-error-report', () => ({
  sentryErrorReport: jest.fn(),
}));

const ENDPOINT = '/user/language';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useUpdateLanguage', () => {
  describe('Initial state', () => {
    it('should start with idle status', () => {
      const { result } = renderHook(() => useUpdateLanguage('es'));
      expect(result.current.status).toBe('idle');
    });

    it('should expose updateLanguage function', () => {
      const { result } = renderHook(() => useUpdateLanguage('es'));
      expect(typeof result.current.updateLanguage).toBe('function');
    });
  });

  describe('Successful update', () => {
    it('should call securePatch with the correct endpoint and language', async () => {
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('en');
      });

      expect(mockSecurePatch).toHaveBeenCalledWith({
        endpoint: ENDPOINT,
        data: { language: 'en' },
      });
    });

    it('should set status to success then idle after a successful PATCH', async () => {
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('en');
      });

      // The finally block resets to idle
      await waitFor(() => {
        expect(result.current.status).toBe('idle');
      });
    });

    it('should NOT show a toast on success', async () => {
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('es');
      });

      expect(mockCallToast).not.toHaveBeenCalled();
    });

    it('should work for both supported languages (es / en)', async () => {
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('es');
      });
      expect(mockSecurePatch).toHaveBeenCalledWith({
        endpoint: ENDPOINT,
        data: { language: 'es' },
      });

      await act(async () => {
        await result.current.updateLanguage('en');
      });
      expect(mockSecurePatch).toHaveBeenCalledWith({
        endpoint: ENDPOINT,
        data: { language: 'en' },
      });
    });
  });

  describe('API error handling', () => {
    it('should show an error toast when the API returns an error', async () => {
      const apiError = {
        en: 'Error updating language preference',
        es: 'Error al actualizar el idioma',
      };
      mockSecurePatch.mockResolvedValue({ data: null, error: apiError });

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('en');
      });

      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: apiError,
      });
    });

    it('should set status to error (then idle) on API error', async () => {
      mockSecurePatch.mockResolvedValue({
        data: null,
        error: { en: 'Error', es: 'Error' },
      });

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('en');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('idle');
      });
    });
  });

  describe('Unexpected exception handling', () => {
    it('should show an error toast on unexpected exception', async () => {
      mockSecurePatch.mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('en');
      });

      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: {
          en: 'Error updating language preference',
          es: 'Error al actualizar el idioma',
        },
      });
    });

    it('should reset to idle after an unexpected exception', async () => {
      mockSecurePatch.mockRejectedValue(new Error('Timeout'));

      const { result } = renderHook(() => useUpdateLanguage('es'));

      await act(async () => {
        await result.current.updateLanguage('en');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('idle');
      });
    });
  });
});
