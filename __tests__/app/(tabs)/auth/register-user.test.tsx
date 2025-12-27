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
import { useOpenTerms } from '@/hooks/useOpenTerms';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

// Mock dependencies
jest.mock('@/hooks/auth/useSignup');
jest.mock('@/hooks/useToast');
jest.mock('@/hooks/useOpenTerms');
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  },
}));
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    auth: { state: 'unauthenticated' },
    getSession: () => [null, null],
  }),
}));
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
  const mockHandleOpenTerms = jest.fn();

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
    (useOpenTerms as jest.Mock).mockReturnValue({
      handleOpenTerms: mockHandleOpenTerms,
    });
  });

  it('should render registration form', () => {
    render(<RegisterUserScreen />);

    expect(screen.getByText('User Registration')).toBeTruthy();
    expect(screen.getByText('Create Account')).toBeTruthy();
    expect(screen.getByText('Back')).toBeTruthy();
  });

  it('should show error toast when terms not accepted', async () => {
    render(<RegisterUserScreen />);

    const submitButton = screen.getByText('Create Account');
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

    // Accept terms - find by checking for disabled false checkbox
    const checkboxes = screen.getAllByA11yState({ disabled: false });
    const termsCheckbox = checkboxes.find(
      (el) => el.props.accessibilityRole === undefined
    );
    if (termsCheckbox) fireEvent.press(termsCheckbox);

    const submitButton = getByText('Create Account');
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

    const submitButton = screen.getByText('Create Account');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should open terms PDF when link pressed', async () => {
    render(<RegisterUserScreen />);

    const termsLink = screen.getByText('Terms and Conditions');
    fireEvent.press(termsLink);

    await waitFor(() => {
      expect(mockHandleOpenTerms).toHaveBeenCalled();
    });
  });

  it('should show loading indicator on submit button when loading', () => {
    (useSignup as jest.Mock).mockReturnValue({
      signup: mockSignup,
      isLoading: true,
      errorMessage: null,
    });

    render(<RegisterUserScreen />);

    const submitButton = screen.getByText('Create Account');
    expect(submitButton.props.accessibilityState?.busy).toBe(true);
  });
});
