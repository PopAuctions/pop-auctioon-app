import { renderHook } from '@testing-library/react-native';
import { useSecureApi } from '@/hooks/api/useSecureApi';

// Mock all dependencies first
global.fetch = jest.fn();

const mockGetSession = jest.fn();
const mockRefreshSession = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
      getUser: mockGetUser,
    },
  },
}));

jest.mock('@/config/api-config', () => ({
  API_CONFIG: {
    API_KEY: 'test-key',
    BASE_URL: 'https://test.com',
    TIMEOUT: 10000,
    MAX_RETRIES: 1,
    RETRY_DELAY: 100,
    RETRY_DELAY_CAP: 1000,
  },
  HEADERS_CONFIG: {
    CONTENT_TYPE_HEADER: 'Content-Type',
    CONTENT_TYPE_VALUE: 'application/json',
    API_KEY_HEADER: 'x-api-key',
    AUTHORIZATION_HEADER: 'Authorization',
    TIMESTAMP_HEADER: 'x-timestamp',
  },
  SECURITY_LEVELS: {
    PROTECTED: 'protected',
    SECURE: 'secure',
  },
  API_ERROR_CODES: {
    MISSING_JWT: 'Missing JWT token',
    NETWORK_ERROR: 'Network error occurred',
  },
  DEV_CONFIG: {
    ENABLE_REQUEST_LOGGING: false,
    ENABLE_RESPONSE_LOGGING: false,
  },
}));

describe('useSecureApi - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup successful fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      clone: () => ({
        text: () => Promise.resolve('{"success": true}'),
        json: () => Promise.resolve({ success: true }),
      }),
      headers: { get: () => 'application/json' },
    });
  });

  it('should return the hook functions', () => {
    const { result } = renderHook(() => useSecureApi());

    expect(typeof result.current.protectedGet).toBe('function');
    expect(typeof result.current.protectedPost).toBe('function');
    expect(typeof result.current.secureGet).toBe('function');
    expect(typeof result.current.securePost).toBe('function');
    expect(typeof result.current.isAuthenticated).toBe('function');
    expect(typeof result.current.getCurrentUser).toBe('function');
    expect(typeof result.current.refreshAuth).toBe('function');
  });

  it('should make protected GET request successfully', async () => {
    const { result } = renderHook(() => useSecureApi());

    const response = await result.current.protectedGet('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.com/api/mobile/protected/test-endpoint',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test-key',
        }),
      })
    );

    expect(response).toEqual({
      data: { success: true },
      status: 200,
      error: undefined,
    });
  });

  it('should make protected POST request successfully', async () => {
    const { result } = renderHook(() => useSecureApi());
    const testData = { title: 'Test', content: 'Body' };

    const response = await result.current.protectedPost(
      '/test-endpoint',
      testData
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.com/api/mobile/protected/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test-key',
        }),
        body: JSON.stringify(testData),
      })
    );

    expect(response).toEqual({
      data: { success: true },
      status: 200,
      error: undefined,
    });
  });

  it('should handle network error with retry logic', async () => {
    // Mock fetch to fail twice (with MAX_RETRIES: 1, total attempts = 2)
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSecureApi());

    const response = await result.current.protectedGet('/test-endpoint');

    // Should retry once and fail
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response).toEqual({
      status: 0,
      error: 'Network error',
    });
  });

  it('should handle HTTP 400 error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad request' }),
      clone: () => ({
        text: () => Promise.resolve('{"error": "Bad request"}'),
        json: () => Promise.resolve({ error: 'Bad request' }),
      }),
      headers: { get: () => 'application/json' },
    });

    const { result } = renderHook(() => useSecureApi());

    const response = await result.current.protectedGet('/test-endpoint');

    expect(response).toEqual({
      data: { error: 'Bad request' },
      status: 400,
      error: 'Bad request',
    });
  });

  it('should handle non-JSON response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Not JSON')),
      clone: () => ({
        text: () => Promise.resolve('Plain text response'),
        json: () => Promise.reject(new Error('Not JSON')),
      }),
      headers: { get: () => 'text/plain' },
    });

    const { result } = renderHook(() => useSecureApi());

    const response = await result.current.protectedGet('/test-endpoint');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      error: 'Non-JSON Response (200)',
      responseText: 'Plain text response',
      contentType: 'text/plain',
    });
  });
});
