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

    expect(screen.getByText(/registerOptions/i)).toBeTruthy();
    expect(screen.getByText(/orRegisterWith/i)).toBeTruthy();
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

    const registerUserButton = screen.getByText(/registerAsUser/i);
    fireEvent.press(registerUserButton);

    expect(router.push).toHaveBeenCalledWith('/(tabs)/auth/register-user');
  });

  it('should navigate to register-auctioneer when auctioneer link pressed', () => {
    render(<RegisterScreen />);

    const registerAuctioneerLink = screen.getByText(/registerAsAuctioneer/i);
    fireEvent.press(registerAuctioneerLink);

    expect(router.push).toHaveBeenCalledWith(
      '/(tabs)/auth/register-auctioneer'
    );
  });

  it('should render divider between sections', () => {
    const { getByTestId } = render(<RegisterScreen />);

    // Assuming Divider has a testID
    const divider = getByTestId('divider');
    expect(divider).toBeTruthy();
  });

  it('should render register as user button as primary mode', () => {
    render(<RegisterScreen />);

    const registerUserButton = screen.getByText(/registerAsUser/i);
    expect(registerUserButton.props.mode).toBe('primary');
  });

  it('should render both provider icons with correct colors', () => {
    const { getByTestId } = render(<RegisterScreen />);

    const googleIcon = getByTestId('icon-google');
    const appleIcon = getByTestId('icon-apple');

    expect(googleIcon).toBeTruthy();
    expect(appleIcon).toBeTruthy();
    expect(googleIcon.props.color).toBe('#DB4437');
    expect(appleIcon.props.color).toBe('#000000');
  });

  it('should have scroll view for content', () => {
    const { getByTestId } = render(<RegisterScreen />);

    const scrollView = getByTestId('scroll-view');
    expect(scrollView).toBeTruthy();
    expect(scrollView.props.contentContainerStyle).toEqual({
      paddingHorizontal: 20,
      paddingTop: 20,
    });
  });
});
