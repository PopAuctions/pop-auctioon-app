import React from 'react';
import { render } from '@testing-library/react-native';
import { DeepLinkListener } from '@/components/navigation/DeepLinkListener';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import type { UserRoles } from '@/types/types';

// Mock dependencies
jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-linking');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('DeepLinkListener', () => {
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

  let eventListener: ((event: { url: string }) => void) | null = null;
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Silence console logs in tests
    jest.useFakeTimers(); // Mock setTimeout

    // Mock router
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(),
      setParams: jest.fn(),
    } as any);

    // Mock Linking.addEventListener to capture the event listener
    mockLinking.addEventListener = jest.fn((eventName, handler) => {
      eventListener = handler as (event: { url: string }) => void;
      return {
        remove: jest.fn(),
      };
    });

    // Mock Linking.getInitialURL to return null by default
    mockLinking.getInitialURL = jest.fn().mockResolvedValue(null);

    // Mock Linking.parse
    mockLinking.parse = jest.fn((url: string) => {
      const parts = url.split('://');
      const scheme = parts[0];
      const pathWithQuery = parts[1] || '';
      const [path] = pathWithQuery.split('?');

      return {
        scheme,
        hostname: null,
        path,
        queryParams: {},
      };
    });
  });

  afterEach(() => {
    eventListener = null;
    jest.useRealTimers();
  });

  describe('Component Lifecycle', () => {
    it('should render without crashing', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      const result = render(<DeepLinkListener />);
      expect(result).toBeTruthy();
    });

    it('should set up deep link event listener on mount', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      render(<DeepLinkListener />);

      expect(mockLinking.addEventListener).toHaveBeenCalledWith(
        'url',
        expect.any(Function)
      );
    });

    it('should check for initial URL on mount', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      render(<DeepLinkListener />);

      expect(mockLinking.getInitialURL).toHaveBeenCalled();
    });

    it('should clean up event listener on unmount', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      const mockRemove = jest.fn();
      mockLinking.addEventListener = jest.fn(() => ({
        remove: mockRemove,
      }));

      const { unmount } = render(<DeepLinkListener />);
      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('Deep Link Handling - Unauthenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });
    });

    it('should handle deep link to account without auth', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://account';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(mockRouterPush).toHaveBeenCalledWith('account');
    });

    it('should handle deep link to nested account route without auth', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://account/edit-profile';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      // Should still try to build navigation stack (ProtectedRoute handles auth)
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Building navigation stack for nested route'
      );
    });

    it('should handle public route without auth', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://home';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(mockRouterPush).toHaveBeenCalledWith('home');
    });
  });

  describe('Deep Link Handling - Authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
    });

    it('should handle deep link to auth routes with active session', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://auth/login';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      // Should build stack for nested auth route
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Building navigation stack for nested route'
      );
    });

    it('should handle account routes when authenticated', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://account';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(mockRouterPush).toHaveBeenCalledWith('account');
    });
  });

  describe('Deep Link Filtering', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });
    });

    it('should ignore expo-development-client deep links', () => {
      render(<DeepLinkListener />);

      const testUrl = 'exp://192.168.1.1:8081/--/expo-development-client';
      eventListener?.({ url: testUrl });

      // Should receive the link but not log it
      expect(console.log).not.toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
    });

    it('should process regular deep links', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://home';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
    });
  });

  describe('Initial URL Handling', () => {
    it('should handle initial URL if present', async () => {
      const initialUrl = 'popauction://account';
      mockLinking.getInitialURL = jest.fn().mockResolvedValue(initialUrl);

      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      render(<DeepLinkListener />);

      // Wait for getInitialURL promise to resolve
      await Promise.resolve();

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        initialUrl
      );
      expect(mockRouterPush).toHaveBeenCalledWith('account');
    });

    it('should handle null initial URL gracefully', async () => {
      mockLinking.getInitialURL = jest.fn().mockResolvedValue(null);

      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      render(<DeepLinkListener />);

      await Promise.resolve();

      // Should not crash, just not log anything
      expect(mockLinking.getInitialURL).toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('Auth State Changes', () => {
    it('should re-evaluate deep links when auth state changes', () => {
      const { rerender } = render(<DeepLinkListener />);

      // Start unauthenticated
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      rerender(<DeepLinkListener />);

      // Trigger deep link
      const testUrl = 'popauction://auth/login';
      eventListener?.({ url: testUrl });

      // Should process the deep link
      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );

      jest.clearAllMocks();
      (console.log as jest.Mock).mockClear();

      // Change to authenticated
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });

      rerender(<DeepLinkListener />);

      // Trigger same deep link
      eventListener?.({ url: testUrl });

      // Should still process and build navigation stack
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Building navigation stack for nested route'
      );
    });
  });

  describe('Multiple Deep Links', () => {
    it('should handle multiple deep links in sequence', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      render(<DeepLinkListener />);

      const urls = [
        'popauction://home',
        'popauction://account',
        'popauction://auctions/calendar',
      ];

      urls.forEach((url) => {
        eventListener?.({ url });
      });

      // Each URL logs at least once (received), account also logs context message
      expect(console.log).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        urls[0]
      );
      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        urls[1]
      );
      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        urls[2]
      );
    });
  });

  describe('Component Return Value', () => {
    it('should return null (no UI)', () => {
      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      const { toJSON } = render(<DeepLinkListener />);

      // Component should not render any visible children
      expect(toJSON()).toBeNull();
    });
  });

  describe('Navigation Stack Building', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        auth: {
          state: 'authenticated',
          session: mockSession,
          role: 'USER' as UserRoles,
        },
        getSession: () => [mockSession, 'USER' as UserRoles],
        signOut: jest.fn(),
      });
    });

    it('should build navigation stack for nested account route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/account/edit-profile';
      eventListener?.({ url: testUrl });

      // Should navigate to parent first
      expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/(tabs)/account');

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      // Then navigate to final destination
      expect(mockRouterPush).toHaveBeenNthCalledWith(
        2,
        '/(tabs)/account/edit-profile'
      );
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Building navigation stack for nested route'
      );
    });

    it('should build navigation stack for nested auctions route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/auctions/123';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/(tabs)/auctions');

      jest.advanceTimersByTime(100);

      expect(mockRouterPush).toHaveBeenNthCalledWith(2, '/(tabs)/auctions/123');
    });

    it('should build navigation stack for nested my-auctions route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/my-auctions/456';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/(tabs)/my-auctions');

      jest.advanceTimersByTime(100);

      expect(mockRouterPush).toHaveBeenNthCalledWith(
        2,
        '/(tabs)/my-auctions/456'
      );
    });

    it('should build navigation stack for nested online-store route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/online-store/products/789';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/(tabs)/online-store');

      jest.advanceTimersByTime(100);

      expect(mockRouterPush).toHaveBeenNthCalledWith(
        2,
        '/(tabs)/online-store/products/789'
      );
    });

    it('should build navigation stack for nested my-online-store route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/my-online-store/inventory';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenNthCalledWith(
        1,
        '/(tabs)/my-online-store'
      );

      jest.advanceTimersByTime(100);

      expect(mockRouterPush).toHaveBeenNthCalledWith(
        2,
        '/(tabs)/my-online-store/inventory'
      );
    });

    it('should build navigation stack for nested auth route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/auth/register';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/(tabs)/auth');

      jest.advanceTimersByTime(100);

      expect(mockRouterPush).toHaveBeenNthCalledWith(
        2,
        '/(tabs)/auth/register'
      );
    });

    it('should NOT build stack for root tab routes', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/home';
      eventListener?.({ url: testUrl });

      // Should navigate directly without setTimeout
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/home');
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Building navigation stack')
      );
    });

    it('should NOT build stack for root account route', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/account';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/account');
    });

    it('should handle deeply nested routes', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauctioonapp:///(tabs)/account/settings/notifications';
      eventListener?.({ url: testUrl });

      expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/(tabs)/account');

      jest.advanceTimersByTime(100);

      expect(mockRouterPush).toHaveBeenNthCalledWith(
        2,
        '/(tabs)/account/settings/notifications'
      );
    });
  });
});
