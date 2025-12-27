import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import RegisterUserScreen from '@/app/(tabs)/auth/register-user';
import { useSignup } from '@/hooks/auth/useSignup';
import { useToast } from '@/hooks/useToast';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

// Mock dependencies
jest.mock('@/hooks/auth/useSignup');
jest.mock('@/hooks/useToast');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
}));
jest.mock('expo-linking');

describe('RegisterUserScreen', () => {
  const mockSignup = jest.fn();
  const mockCallToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSignup as jest.Mock).mockReturnValue({
      signup: mockSignup,
      isLoading: false,
      errorMessage: null,
    });
    (useToast as jest.Mock).mockReturnValue({
      callToast: mockCallToast,
    });
  });

  it('should render registration form', () => {
    render(<RegisterUserScreen />);

    expect(screen.getByText(/registerFormTitle/i)).toBeTruthy();
    expect(screen.getByText(/createAccount/i)).toBeTruthy();
    expect(screen.getByText(/globals.back/i)).toBeTruthy();
  });

  it('should show error toast when terms not accepted', async () => {
    render(<RegisterUserScreen />);

    const submitButton = screen.getByText(/createAccount/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: {
          es: 'Debes aceptar los términos y condiciones',
          en: 'You must accept the terms and conditions',
        },
      });
    });
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should successfully register user and navigate to account', async () => {
    mockSignup.mockResolvedValue({
      success: true,
      email: 'test@example.com',
    });

    const { getByText, getByPlaceholderText } = render(<RegisterUserScreen />);

    // Fill form (simplified - in real test you'd fill all fields)
    // For now we'll just accept terms and submit
    const termsCheckbox = screen.getByTestId('terms-checkbox'); // Assuming checkbox has testID
    fireEvent.press(termsCheckbox);

    const submitButton = getByText(/createAccount/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.any(String),
          password: expect.any(String),
        }),
        'USER',
        'en'
      );
    });

    await waitFor(() => {
      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'success',
        description: {
          es: 'Usuario creado. Revisa tu email para confirmar tu cuenta.',
          en: 'User created. Check your email to confirm your account.',
        },
      });
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/account');
  });

  it('should show error toast when signup fails', async () => {
    const errorMessage = {
      en: 'Invalid Fields',
      es: 'Campos inválidos',
    };

    mockSignup.mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    const { getByText } = render(<RegisterUserScreen />);

    // Accept terms
    const termsCheckbox = screen.getByTestId('terms-checkbox');
    fireEvent.press(termsCheckbox);

    const submitButton = getByText(/createAccount/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: errorMessage,
      });
    });

    expect(router.replace).not.toHaveBeenCalled();
  });

  it('should disable submit button when loading', () => {
    (useSignup as jest.Mock).mockReturnValue({
      signup: mockSignup,
      isLoading: true,
      errorMessage: null,
    });

    render(<RegisterUserScreen />);

    const submitButton = screen.getByText(/createAccount/i);
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should disable submit button when terms not accepted', () => {
    render(<RegisterUserScreen />);

    const submitButton = screen.getByText(/createAccount/i);
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should open terms PDF when link pressed', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(true);

    render(<RegisterUserScreen />);

    const termsLink = screen.getByText(/termsAndConditions/i);
    fireEvent.press(termsLink);

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalled();
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://www.popauction.com/documents/TC-2025-07-14.pdf'
      );
    });
  });

  it('should show error toast when terms PDF cannot be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    render(<RegisterUserScreen />);

    const termsLink = screen.getByText(/termsAndConditions/i);
    fireEvent.press(termsLink);

    await waitFor(() => {
      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: {
          es: 'No se pudo abrir el documento',
          en: 'Could not open document',
        },
      });
    });
  });

  it('should show loading indicator on submit button when loading', () => {
    (useSignup as jest.Mock).mockReturnValue({
      signup: mockSignup,
      isLoading: true,
      errorMessage: null,
    });

    render(<RegisterUserScreen />);

    const submitButton = screen.getByText(/createAccount/i);
    expect(submitButton.props.isLoading).toBe(true);
  });
});
