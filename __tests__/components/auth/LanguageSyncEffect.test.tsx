import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { LanguageSyncEffect } from '@/components/auth/LanguageSyncEffect';

// --- mocks ---
const mockSecureGet = jest.fn();
const mockSecurePatch = jest.fn();
const mockSyncLanguageFromDb = jest.fn();
const mockGetManualLanguageFlag = jest.fn();
const mockClearManualLanguageFlag = jest.fn();
const mockGetCurrentLocale = jest.fn(() => 'es');

let mockAuthState: any = { state: 'unauthenticated' };

jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({ auth: mockAuthState }),
}));

jest.mock('@/context/translation-context', () => ({
  useTranslationContext: () => ({
    syncLanguageFromDb: mockSyncLanguageFromDb,
  }),
}));

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({
    secureGet: mockSecureGet,
    securePatch: mockSecurePatch,
  }),
}));

jest.mock('@/i18n', () => ({
  getManualLanguageFlag: (...args: any[]) => mockGetManualLanguageFlag(...args),
  clearManualLanguageFlag: (...args: any[]) =>
    mockClearManualLanguageFlag(...args),
  getCurrentLocale: (...args: any[]) => mockGetCurrentLocale(...args),
}));

jest.mock('@/lib/error/sentry-error-report', () => ({
  sentryErrorReport: jest.fn(),
}));

const session = (id = 'user-123') => ({
  state: 'authenticated',
  session: { user: { id } },
  role: 'USER',
});

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthState = { state: 'unauthenticated' };
  // Default: no manual flag, no pending push
  mockGetManualLanguageFlag.mockResolvedValue(false);
  mockClearManualLanguageFlag.mockResolvedValue(undefined);
  mockGetCurrentLocale.mockReturnValue('es');
});

// ---------------------------------------------------------------------------
// Unauthenticated / loading
// ---------------------------------------------------------------------------
describe('LanguageSyncEffect', () => {
  describe('Unauthenticated / loading — no action', () => {
    it('should NOT call secureGet when user is unauthenticated', async () => {
      mockAuthState = { state: 'unauthenticated' };
      render(<LanguageSyncEffect />);
      await waitFor(() => expect(mockSecureGet).not.toHaveBeenCalled());
    });

    it('should NOT call securePatch when user is unauthenticated', async () => {
      mockAuthState = { state: 'unauthenticated' };
      render(<LanguageSyncEffect />);
      await waitFor(() => expect(mockSecurePatch).not.toHaveBeenCalled());
    });

    it('should NOT call secureGet while auth is loading', async () => {
      mockAuthState = { state: 'loading' };
      render(<LanguageSyncEffect />);
      await waitFor(() => expect(mockSecureGet).not.toHaveBeenCalled());
    });

    it('should render nothing (returns null)', () => {
      mockAuthState = { state: 'unauthenticated' };
      const { toJSON } = render(<LanguageSyncEffect />);
      expect(toJSON()).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // No manual flag → DB wins (pull)
  // ---------------------------------------------------------------------------
  describe('Login — no manual flag → DB language wins', () => {
    it('should call secureGet with CURRENT_USER endpoint', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockResolvedValue({
        data: { id: 'user-123', language: 'en' },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockSecureGet).toHaveBeenCalledWith({
          endpoint: '/user/current',
        });
      });
    });

    it('should call syncLanguageFromDb with "en" when DB says "en"', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockResolvedValue({
        data: { id: 'user-123', language: 'en' },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockSyncLanguageFromDb).toHaveBeenCalledWith('en');
      });
      expect(mockSecurePatch).not.toHaveBeenCalled();
    });

    it('should call syncLanguageFromDb with "es" when DB says "es"', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockResolvedValue({
        data: { id: 'user-123', language: 'es' },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockSyncLanguageFromDb).toHaveBeenCalledWith('es');
      });
    });

    it('should NOT call syncLanguageFromDb if DB language field is null', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockResolvedValue({
        data: { id: 'user-123', language: null },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => expect(mockSecureGet).toHaveBeenCalled());
      expect(mockSyncLanguageFromDb).not.toHaveBeenCalled();
    });

    it('should NOT call syncLanguageFromDb when API returns error', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockResolvedValue({
        data: null,
        error: { en: 'Unauthorized', es: 'No autorizado' },
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => expect(mockSecureGet).toHaveBeenCalled());
      expect(mockSyncLanguageFromDb).not.toHaveBeenCalled();
    });

    it('should NOT call syncLanguageFromDb on unexpected exception', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockRejectedValue(new Error('Network error'));

      render(<LanguageSyncEffect />);

      await waitFor(() => expect(mockSecureGet).toHaveBeenCalled());
      expect(mockSyncLanguageFromDb).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Manual flag set → local wins (push)
  // ---------------------------------------------------------------------------
  describe('Login — manual flag set → local language wins (push to DB)', () => {
    it('should call securePatch with local locale instead of secureGet', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(true);
      mockGetCurrentLocale.mockReturnValue('en');
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockSecurePatch).toHaveBeenCalledWith({
          endpoint: '/user/language',
          data: { language: 'en' },
        });
      });
      expect(mockSecureGet).not.toHaveBeenCalled();
    });

    it('should push "es" when local locale is "es"', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(true);
      mockGetCurrentLocale.mockReturnValue('es');
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockSecurePatch).toHaveBeenCalledWith({
          endpoint: '/user/language',
          data: { language: 'es' },
        });
      });
    });

    it('should clear the manual flag after a successful push', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(true);
      mockGetCurrentLocale.mockReturnValue('en');
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockClearManualLanguageFlag).toHaveBeenCalledTimes(1);
      });
    });

    it('should NOT call syncLanguageFromDb when manual flag is set', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(true);
      mockGetCurrentLocale.mockReturnValue('en');
      mockSecurePatch.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => expect(mockSecurePatch).toHaveBeenCalled());
      expect(mockSyncLanguageFromDb).not.toHaveBeenCalled();
    });

    it('should still clear the flag even if the PATCH fails (avoid being stuck)', async () => {
      mockAuthState = session();
      mockGetManualLanguageFlag.mockResolvedValue(true);
      mockGetCurrentLocale.mockReturnValue('en');
      mockSecurePatch.mockResolvedValue({
        data: null,
        error: { en: 'Server error', es: 'Error del servidor' },
      });

      render(<LanguageSyncEffect />);

      await waitFor(() => {
        expect(mockClearManualLanguageFlag).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Deduplication
  // ---------------------------------------------------------------------------
  describe('Deduplication — sync only once per session', () => {
    it('should sync only once even if re-rendered', async () => {
      mockAuthState = session('user-abc');
      mockGetManualLanguageFlag.mockResolvedValue(false);
      mockSecureGet.mockResolvedValue({
        data: { id: 'user-abc', language: 'en' },
        error: null,
      });

      const { rerender } = render(<LanguageSyncEffect />);

      await waitFor(() => expect(mockSecureGet).toHaveBeenCalledTimes(1));

      rerender(<LanguageSyncEffect />);

      await waitFor(() => expect(mockSecureGet).toHaveBeenCalledTimes(1));
    });
  });
});
