import { renderHook } from '@testing-library/react-native';
import { useSecureApi } from '@/hooks/api/useSecureApi';

// Mock simple de todo lo que necesita el hook
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: { session: { access_token: 'test-token' } },
          error: null,
        }),
      refreshSession: () =>
        Promise.resolve({
          data: { session: { access_token: 'new-token' } },
          error: null,
        }),
    },
  },
}));

jest.mock('@/config/api-config', () => ({
  API_CONFIG: {
    API_KEY: 'test-key',
    BASE_URL: 'https://test.com',
  },
  HEADERS_CONFIG: {
    CONTENT_TYPE_HEADER: 'Content-Type',
    CONTENT_TYPE_VALUE: 'application/json',
    API_KEY_HEADER: 'x-api-key',
    JWT_HEADER: 'Authorization',
    TIMESTAMP_HEADER: 'x-timestamp',
  },
  DEV_CONFIG: {
    ENABLE_REQUEST_LOGGING: false,
  },
}));

describe('useSecureApi', () => {
  it('should return the hook functions', () => {
    const { result } = renderHook(() => useSecureApi());

    // Verificar que el hook devuelve las funciones esperadas
    expect(typeof result.current.protectedGet).toBe('function');
    expect(typeof result.current.protectedPost).toBe('function');
    expect(typeof result.current.secureGet).toBe('function');
    expect(typeof result.current.securePost).toBe('function');
    expect(typeof result.current.isAuthenticated).toBe('function');
  });

  it('should have refreshAuth function', () => {
    const { result } = renderHook(() => useSecureApi());

    expect(typeof result.current.refreshAuth).toBe('function');
  });

  it('should handle hook initialization without errors', () => {
    expect(() => {
      renderHook(() => useSecureApi());
    }).not.toThrow();
  });

  it('should call isAuthenticated function', async () => {
    const { result } = renderHook(() => useSecureApi());

    await expect(result.current.isAuthenticated()).resolves.toBeDefined();
  });

  it('should call refreshAuth function without crashing', async () => {
    const { result } = renderHook(() => useSecureApi());

    expect(() => {
      result.current.refreshAuth();
    }).not.toThrow();
  });

  it('should have all available methods', () => {
    const { result } = renderHook(() => useSecureApi());

    // Verificar métodos protegidos
    expect(typeof result.current.protectedGet).toBe('function');
    expect(typeof result.current.protectedPost).toBe('function');

    // Verificar métodos seguros
    expect(typeof result.current.secureGet).toBe('function');
    expect(typeof result.current.securePost).toBe('function');

    // Verificar utilidades
    expect(typeof result.current.isAuthenticated).toBe('function');
    expect(typeof result.current.refreshAuth).toBe('function');
  });
});
