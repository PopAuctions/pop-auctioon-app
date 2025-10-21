import React from 'react';
import { render } from '@testing-library/react-native';
import { DeepLinkListener } from '@/components/navigation/DeepLinkListener';
import { useAuth } from '@/context/auth-context';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import type { UserRoles } from '@/types/types';

// Mock dependencies
jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-linking');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
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

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Silence console logs in tests

    // Mock Linking.addEventListener to capture the event listener
    mockLinking.addEventListener = jest.fn((eventName, handler) => {
      eventListener = handler as (event: { url: string }) => void;
      return {
        remove: jest.fn(),
      };
    });

    // Mock Linking.getInitialURL to return null by default
    mockLinking.getInitialURL = jest.fn().mockResolvedValue(null);
  });

  afterEach(() => {
    eventListener = null;
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

    it('should log when deep link to account is received without auth', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://account';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Deep link a cuenta sin auth')
      );
    });

    it('should log when deep link to edit-profile is received without auth', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://account/edit-profile';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Deep link a cuenta sin auth')
      );
    });

    it('should not log special message for public routes', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://home';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('sin auth')
      );
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

    it('should log when deep link to auth is received with active session', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://auth/login';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Deep link a auth con sesión')
      );
    });

    it('should not log special message for account routes when authenticated', () => {
      render(<DeepLinkListener />);

      const testUrl = 'popauction://account';
      eventListener?.({ url: testUrl });

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        testUrl
      );
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('sin auth')
      );
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
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(console.log).toHaveBeenCalledWith(
        '🔗 Deep link received:',
        initialUrl
      );
    });

    it('should handle null initial URL gracefully', async () => {
      mockLinking.getInitialURL = jest.fn().mockResolvedValue(null);

      mockUseAuth.mockReturnValue({
        auth: { state: 'unauthenticated' },
        getSession: () => [null, null],
        signOut: jest.fn(),
      });

      render(<DeepLinkListener />);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should not crash, just not log anything
      expect(mockLinking.getInitialURL).toHaveBeenCalled();
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

      // Should not log authenticated message
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('con sesión')
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

      // Should now log authenticated message
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('con sesión')
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
});
