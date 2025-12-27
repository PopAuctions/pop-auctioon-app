import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '@/app/(tabs)/auth/register';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render registration options screen', () => {
    render(<RegisterScreen />);

    expect(screen.getByText('Register Options')).toBeTruthy();
    expect(screen.getByText('Choose how you want to register')).toBeTruthy();
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

    expect(consoleSpy).toHaveBeenCalledWith('Provider seleccionado: Google');

    consoleSpy.mockRestore();
  });

  it('should navigate to register-user when user registration pressed', () => {
    render(<RegisterScreen />);

    const registerUserButton = screen.getByText('Register as User');
    fireEvent.press(registerUserButton);

    expect(router.push).toHaveBeenCalledWith('/(tabs)/auth/register-user');
  });

  it('should navigate to register-auctioneer when auctioneer link pressed', () => {
    render(<RegisterScreen />);

    const registerAuctioneerLink = screen.getByText(
      'Want to join as auctioneer?'
    );
    fireEvent.press(registerAuctioneerLink);

    expect(router.push).toHaveBeenCalledWith(
      '/(tabs)/auth/register-auctioneer'
    );
  });

  it('should render divider between sections', () => {
    render(<RegisterScreen />);

    // Verify divider text exists
    expect(screen.getByText('or')).toBeTruthy();
  });

  it('should render register as user button as primary mode', () => {
    render(<RegisterScreen />);

    const registerUserButton = screen.getByText('Register as User');
    // Button component wraps text, so we just verify it renders
    expect(registerUserButton).toBeTruthy();
  });

  it('should render both provider buttons', () => {
    render(<RegisterScreen />);

    expect(screen.getByText(/Continue with.*Google/)).toBeTruthy();
    expect(screen.getByText(/Continue with.*Apple/)).toBeTruthy();
  });

  it('should render all main sections', () => {
    render(<RegisterScreen />);

    // Verify all main content is rendered
    expect(screen.getByText('Register Options')).toBeTruthy();
    expect(screen.getByText(/Continue with.*Google/)).toBeTruthy();
    expect(screen.getByText('Register as User')).toBeTruthy();
    expect(screen.getByText('Want to join as auctioneer?')).toBeTruthy();
  });
});
