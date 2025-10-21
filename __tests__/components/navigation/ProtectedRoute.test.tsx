import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { useAuth } from '@/context/auth-context';
import { useSegments, useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import type { UserRoles } from '@/types/types';

// Mock dependencies
jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-router', () => ({
  useSegments: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/components/navigation/routeConfig', () => ({
  PROTECTED_ROUTES: {
    account: {},
    'edit-profile': {},
    'my-auctions': { requiredRole: 'AUCTIONEER' as const },
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSegments = useSegments as jest.MockedFunction<typeof useSegments>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('ProtectedRoute', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    console.log = jest.fn(); // Silence console logs in tests
  });

  describe('Loading State', () => {
    it('should not redirect when auth state is loading', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'loading' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'account']);

      render(
        <ProtectedRoute>
          <Text>Protected Content</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });
    });

    it('should redirect to auth when accessing protected route without session', async () => {
      mockUseSegments.mockReturnValue(['(tabs)', 'account']);

      render(
        <ProtectedRoute>
          <Text>Protected Content</Text>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/auth');
      });
    });

    it('should redirect to auth when accessing role-protected route without session', async () => {
      mockUseSegments.mockReturnValue(['(tabs)', 'my-auctions']);

      render(
        <ProtectedRoute>
          <Text>Protected Content</Text>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/auth');
      });
    });

    it('should allow access to public routes without session', () => {
      mockUseSegments.mockReturnValue(['(tabs)', 'auctions', 'calendar']);

      render(
        <ProtectedRoute>
          <Text>Public Content</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Authenticated User', () => {
    it('should allow access to protected route with any role', () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'account']);

      render(
        <ProtectedRoute>
          <Text>Protected Content</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should allow access to role-specific route with correct role', () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'AUCTIONEER' as UserRoles,
        },
        getSession: () => [mockSession, 'AUCTIONEER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'my-auctions']);

      render(
        <ProtectedRoute>
          <Text>Auctioneer Content</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should redirect to home when user has insufficient role', async () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'my-auctions']);

      render(
        <ProtectedRoute>
          <Text>Auctioneer Content</Text>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home');
      });
    });

    it('should wait for role resolution before granting access', () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: null,
        },
        getSession: () => [mockSession, null],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'my-auctions']);

      render(
        <ProtectedRoute>
          <Text>Auctioneer Content</Text>
        </ProtectedRoute>
      );

      // Should not redirect, just wait
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should redirect to home when already authenticated and in auth group', async () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'auth', 'login']);

      render(
        <ProtectedRoute>
          <Text>Auth Content</Text>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home');
      });
    });
  });

  describe('Nested Routes', () => {
    it('should handle nested routes correctly - account/edit-profile', () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'account', 'edit-profile']);

      render(
        <ProtectedRoute>
          <Text>Edit Profile</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should extract correct route from deeply nested segments', () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue([
        '(tabs)',
        'account',
        'info',
        'about-us',
      ]);

      render(
        <ProtectedRoute>
          <Text>About Us</Text>
        </ProtectedRoute>
      );

      // about-us is not a protected route, should allow access
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Public Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });
    });

    it('should allow access to home', () => {
      mockUseSegments.mockReturnValue(['(tabs)', 'home']);

      render(
        <ProtectedRoute>
          <Text>Home</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should allow access to auctions', () => {
      mockUseSegments.mockReturnValue(['(tabs)', 'auctions']);

      render(
        <ProtectedRoute>
          <Text>Auctions</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should allow access to store', () => {
      mockUseSegments.mockReturnValue(['(tabs)', 'store']);

      render(
        <ProtectedRoute>
          <Text>Store</Text>
        </ProtectedRoute>
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Children Rendering', () => {
    it('should render children when no redirect is needed', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'home']);

      const { getByText } = render(
        <ProtectedRoute>
          <Text>Public Content</Text>
        </ProtectedRoute>
      );

      expect(getByText('Public Content')).toBeTruthy();
    });

    it('should render children for authenticated users on protected routes', () => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
      mockUseSegments.mockReturnValue(['(tabs)', 'account']);

      const { getByText } = render(
        <ProtectedRoute>
          <Text>Protected Content</Text>
        </ProtectedRoute>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });
});
