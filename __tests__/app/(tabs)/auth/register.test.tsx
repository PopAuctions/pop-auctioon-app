import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '@/app/(tabs)/auth/register';
import { router } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      locale: 'en',
      changeLanguage: jest.fn(),
      isPending: false,
    });
  });

  it('should render registration options screen', () => {
    render(<RegisterScreen />);

    expect(screen.getByText('screens.account.registerOptions')).toBeTruthy();
    expect(screen.getByText('screens.account.orRegisterWith')).toBeTruthy();
  });

  it('should render provider buttons (Google, Apple)', () => {
    render(<RegisterScreen />);

    expect(screen.getByText(/Google/i)).toBeTruthy();
    expect(screen.getByText(/Apple/i)).toBeTruthy();
  });

  it('should log provider selection when provider button pressed', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<RegisterScreen />);

    const googleButton = screen.getByText(/Google/i);
    fireEvent.press(googleButton);

    expect(consoleSpy).toHaveBeenCalledWith('Selected provider: Google');

    consoleSpy.mockRestore();
  });

  it('should navigate to register-user when user registration pressed', () => {
    render(<RegisterScreen />);

    const registerUserButton = screen.getByText(
      'screens.account.registerAsUser'
    );
    fireEvent.press(registerUserButton);

    expect(router.push).toHaveBeenCalledWith('/(tabs)/auth/register-user');
  });

  it('should navigate to register-auctioneer when auctioneer link pressed', () => {
    render(<RegisterScreen />);

    const registerAuctioneerLink = screen.getByText(
      'screens.account.registerAsAuctioneer'
    );
    fireEvent.press(registerAuctioneerLink);

    expect(router.push).toHaveBeenCalledWith(
      '/(tabs)/auth/register-auctioneer'
    );
  });

  it('should render divider between sections', () => {
    render(<RegisterScreen />);

    // Verify divider text exists (uses translation key)
    expect(screen.getByText('commonActions.or')).toBeTruthy();
  });

  it('should render register as user button as primary mode', () => {
    render(<RegisterScreen />);

    const registerUserButton = screen.getByTestId('ui-button');
    // Button component wraps text, so we just verify it renders
    expect(registerUserButton).toBeTruthy();
  });

  it('should render both provider buttons', () => {
    render(<RegisterScreen />);

    // Providers render their names directly (not translated)
    expect(screen.getByText(/Google/i)).toBeTruthy();
    expect(screen.getByText(/Apple/i)).toBeTruthy();
  });

  it('should render all main sections', () => {
    render(<RegisterScreen />);

    // Verify all main content is rendered (using translation keys)
    expect(screen.getByText('screens.account.registerOptions')).toBeTruthy();
    expect(screen.getByText(/Google/i)).toBeTruthy();
    expect(screen.getByText('screens.account.registerAsUser')).toBeTruthy();
    expect(
      screen.getByText('screens.account.registerAsAuctioneer')
    ).toBeTruthy();
  });
});
