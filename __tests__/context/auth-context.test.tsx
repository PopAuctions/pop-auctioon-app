import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/auth-context';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRoles, AsyncResponse } from '@/types/types';

// Mock supabase
const mockGetSession = jest.fn();
const mockGetUser = jest.fn();
const mockSignOut = jest.fn();
const mockRefreshSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args),
      getUser: (...args: any[]) => mockGetUser(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      refreshSession: (...args: any[]) => mockRefreshSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
    },
  },
}));

// Mock getUserRole
const mockGetUserRole = jest.fn();
jest.mock('@/lib/auth/get-user-role', () => ({
  getUserRole: (...args: any[]) => mockGetUserRole(...args),
}));

describe('AuthContext', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  let authStateCallback:
    | ((event: string, session: Session | null) => void)
    | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    console.log = jest.fn();
    console.warn = jest.fn();
    authStateCallback = null;

    // Default mock implementations
    mockOnAuthStateChange.mockImplementation((callback: any) => {
      authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      };
    });

    mockSignOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial States', () => {
    it('should start with loading state', () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.auth.state).toBe('loading');
    });

    it('should transition to unauthenticated when no user found', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });
    });

    it('should transition to authenticated with USER role', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      const roleResponse: AsyncResponse<UserRoles> = {
        data: 'USER',
        success: true,
      };
      mockGetUserRole.mockResolvedValue(roleResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      if (result.current.auth.state === 'authenticated') {
        expect(result.current.auth.session).toEqual(mockSession);
        expect(result.current.auth.role).toBe('USER');
      }
    });

    it('should transition to authenticated with AUCTIONEER role', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'AUCTIONEER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      if (result.current.auth.state === 'authenticated') {
        expect(result.current.auth.role).toBe('AUCTIONEER');
      }
    });

    it('should handle authenticated state with null role', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({ data: null, success: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      if (result.current.auth.state === 'authenticated') {
        expect(result.current.auth.role).toBeNull();
      }
    });
  });

  describe('getSession Method', () => {
    it('should return [null, null] when unauthenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });

      const [session, role] = result.current.getSession();
      expect(session).toBeNull();
      expect(role).toBeNull();
    });

    it('should return [session, role] when authenticated', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      const [session, role] = result.current.getSession();
      expect(session).toEqual(mockSession);
      expect(role).toBe('USER');
    });
  });

  describe('signOut Method', () => {
    it('should call supabase.auth.signOut successfully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle signOut error gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });
      mockSignOut.mockResolvedValue({
        error: { message: 'Network error' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(console.warn).toHaveBeenCalledWith(
        '[signOut] error:',
        'Network error'
      );
    });
  });

  describe('Auth State Change Events', () => {
    it('should handle SIGNED_IN event', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser
        .mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'No user' },
        })
        .mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });

      await act(async () => {
        if (authStateCallback) {
          await authStateCallback('SIGNED_IN', mockSession);
        }
      });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });
    });

    it('should handle SIGNED_OUT event', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      await act(async () => {
        if (authStateCallback) {
          await authStateCallback('SIGNED_OUT', null);
        }
      });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });
    });

    it('should handle TOKEN_REFRESHED event', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      const newSession: Session = {
        ...mockSession,
        access_token: 'new-access-token',
      };

      await act(async () => {
        if (authStateCallback) {
          await authStateCallback('TOKEN_REFRESHED', newSession);
        }
      });

      await waitFor(() => {
        if (result.current.auth.state === 'authenticated') {
          expect(result.current.auth.session.access_token).toBe(
            'new-access-token'
          );
        }
      });
    });

    it('should transition to unauthenticated on SIGNED_IN with error', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser
        .mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'No user' },
        })
        .mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' },
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });

      await act(async () => {
        if (authStateCallback) {
          await authStateCallback('SIGNED_IN', mockSession);
        }
      });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle getUser error and sign out', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle user exists but no session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user' },
      });

      const { unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should not crash on unmount', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle race condition with component unmount', async () => {
      mockGetSession.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: { session: mockSession }, error: null });
            }, 100);
          })
      );
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { unmount, result } = renderHook(() => useAuth(), { wrapper });

      unmount();

      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.auth.state).toBe('loading');
    });

    it('should handle getUserRole returning undefined role', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockGetUserRole.mockResolvedValue({
        data: undefined as any,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });

      if (result.current.auth.state === 'authenticated') {
        expect(result.current.auth.role).toBeUndefined();
      }
    });

    it('should handle multiple rapid state changes', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockGetUser
        .mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'No user' },
        })
        .mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });
      mockGetUserRole.mockResolvedValue({
        data: 'USER' as UserRoles,
        success: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('unauthenticated');
      });

      await act(async () => {
        if (authStateCallback) {
          await authStateCallback('SIGNED_IN', mockSession);
        }
      });

      await waitFor(() => {
        expect(result.current.auth.state).toBe('authenticated');
      });
    });
  });
});
