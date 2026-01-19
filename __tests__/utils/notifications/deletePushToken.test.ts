import { deletePushToken } from '@/utils/notifications/deletePushToken';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Mock dependencies
jest.mock('@/lib/error/sentry-error-report');

describe('deletePushToken', () => {
  let mockProtectedPost: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProtectedPost = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Null/Empty Token Handling', () => {
    it('should return early and log warning when token is null', async () => {
      await deletePushToken(null, mockProtectedPost);

      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️ No push token to delete');
      expect(mockProtectedPost).not.toHaveBeenCalled();
    });

    it('should return early and log warning when token is empty string', async () => {
      await deletePushToken('', mockProtectedPost);

      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️ No push token to delete');
      expect(mockProtectedPost).not.toHaveBeenCalled();
    });
  });

  describe('Successful Token Deletion', () => {
    it('should successfully delete push token', async () => {
      const mockToken = 'ExponentPushToken[test-token]';
      mockProtectedPost.mockResolvedValue({ data: { success: true } });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🗑️ Deleting push token from database...'
      );
      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: { token: mockToken },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Push token deleted successfully'
      );
      expect(sentryErrorReport).not.toHaveBeenCalled();
    });

    it('should call protectedPost with correct parameters', async () => {
      const mockToken = 'ExponentPushToken[abc123]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(mockProtectedPost).toHaveBeenCalledTimes(1);
      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: {
          token: mockToken,
        },
      });
    });
  });

  describe('Error Handling from API', () => {
    it('should handle API error response and report to Sentry', async () => {
      const mockToken = 'ExponentPushToken[test-token]';
      const mockError = {
        en: 'Token not found',
        es: 'Token no encontrado',
      };
      mockProtectedPost.mockResolvedValue({ error: mockError });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERROR_DELETE_PUSH_TOKEN',
        mockError
      );
      expect(sentryErrorReport).toHaveBeenCalledWith(
        expect.any(Error),
        'DELETE_PUSH_TOKEN_ERROR'
      );
    });

    it('should handle network error and report to Sentry', async () => {
      const mockToken = 'ExponentPushToken[test-token]';
      const networkError = new Error('Network request failed');
      mockProtectedPost.mockRejectedValue(networkError);

      await deletePushToken(mockToken, mockProtectedPost);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERROR_DELETE_PUSH_TOKEN_CATCH',
        networkError
      );
      expect(sentryErrorReport).toHaveBeenCalledWith(
        networkError,
        'DELETE_PUSH_TOKEN_CATCH_ERROR'
      );
    });

    it('should handle timeout error gracefully', async () => {
      const mockToken = 'ExponentPushToken[test-token]';
      const timeoutError = new Error('Request timeout');
      mockProtectedPost.mockRejectedValue(timeoutError);

      await deletePushToken(mockToken, mockProtectedPost);

      expect(sentryErrorReport).toHaveBeenCalledWith(
        timeoutError,
        'DELETE_PUSH_TOKEN_CATCH_ERROR'
      );
    });
  });

  describe('Various Token Formats', () => {
    it('should handle valid Expo push token format', async () => {
      const mockToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: { token: mockToken },
      });
    });

    it('should handle token with special characters', async () => {
      const mockToken = 'ExponentPushToken[abc-123_xyz]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: { token: mockToken },
      });
    });

    it('should handle very long token strings', async () => {
      const mockToken = 'ExponentPushToken[' + 'x'.repeat(200) + ']';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: { token: mockToken },
      });
    });
  });

  describe('Concurrent Deletion Attempts', () => {
    it('should handle multiple deletion attempts in sequence', async () => {
      const mockToken1 = 'ExponentPushToken[token1]';
      const mockToken2 = 'ExponentPushToken[token2]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken1, mockProtectedPost);
      await deletePushToken(mockToken2, mockProtectedPost);

      expect(mockProtectedPost).toHaveBeenCalledTimes(2);
      expect(mockProtectedPost).toHaveBeenNthCalledWith(1, {
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: { token: mockToken1 },
      });
      expect(mockProtectedPost).toHaveBeenNthCalledWith(2, {
        endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        data: { token: mockToken2 },
      });
    });

    it('should handle parallel deletion attempts', async () => {
      const mockToken1 = 'ExponentPushToken[token1]';
      const mockToken2 = 'ExponentPushToken[token2]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await Promise.all([
        deletePushToken(mockToken1, mockProtectedPost),
        deletePushToken(mockToken2, mockProtectedPost),
      ]);

      expect(mockProtectedPost).toHaveBeenCalledTimes(2);
    });
  });

  describe('Endpoint Configuration', () => {
    it('should use correct endpoint from config', async () => {
      const mockToken = 'ExponentPushToken[test]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(mockProtectedPost).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
        })
      );
    });
  });

  describe('Logging Behavior', () => {
    it('should log start message before deletion', async () => {
      const mockToken = 'ExponentPushToken[test]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🗑️ Deleting push token from database...'
      );
    });

    it('should log success message after deletion', async () => {
      const mockToken = 'ExponentPushToken[test]';
      mockProtectedPost.mockResolvedValue({ data: {} });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Push token deleted successfully'
      );
    });

    it('should log error message on failure', async () => {
      const mockToken = 'ExponentPushToken[test]';
      const mockError = { en: 'Error', es: 'Error' };
      mockProtectedPost.mockResolvedValue({ error: mockError });

      await deletePushToken(mockToken, mockProtectedPost);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERROR_DELETE_PUSH_TOKEN',
        mockError
      );
    });
  });
});
