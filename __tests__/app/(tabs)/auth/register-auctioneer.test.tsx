import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RegisterAuctioneerScreen from '@/app/(tabs)/auth/register-auctioneer';

jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  },
}));

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    changeLanguage: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/hooks/auth/useSignup', () => ({
  useSignup: () => ({
    signup: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    callToast: jest.fn(),
  }),
}));

jest.mock('@/hooks/useOpenTerms', () => ({
  useOpenTerms: () => ({
    handleOpenTerms: jest.fn(),
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('RegisterAuctioneerScreen', () => {
  it('should render form fields', () => {
    render(<RegisterAuctioneerScreen />);

    // Check for essential form elements using translation keys
    expect(
      screen.getByPlaceholderText('screens.editProfile.name')
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText('screens.editProfile.lastName')
    ).toBeTruthy();
    expect(screen.getByPlaceholderText('loginPage.email')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('screens.editProfile.username')
    ).toBeTruthy();
  });

  it('should render auctioneer-specific fields', () => {
    render(<RegisterAuctioneerScreen />);

    // Auctioneer-specific fields
    expect(
      screen.getByPlaceholderText('screens.editProfile.storeName')
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText('screens.editProfile.address')
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText('screens.editProfile.town')
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText('screens.editProfile.province')
    ).toBeTruthy();
  });

  it('should render create account button', () => {
    render(<RegisterAuctioneerScreen />);

    const button = screen.getByTestId('ui-button');
    expect(button).toBeTruthy();
  });

  it('should render without crashing', () => {
    expect(() => render(<RegisterAuctioneerScreen />)).not.toThrow();
  });
});
