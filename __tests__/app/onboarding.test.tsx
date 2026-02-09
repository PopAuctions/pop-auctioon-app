import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from '@/app/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Mocks
const mockReplace = jest.fn();
const mockUseOnboardingData = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
  Stack: {
    Screen: ({ children }: any) => children,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('@/hooks/pages/onboarding/useOnboardingData', () => ({
  useOnboardingData: () => mockUseOnboardingData(),
}));

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'commonErrors.generic': 'Error',
        'commonErrors.defaultMessage': 'Intenta de nuevo más tarde',
        'globals.refreshPage': 'Reintentar',
        'globals.goToHome': 'Ir a inicio',
        'commonActions.loading': 'Cargando...',
      };
      return translations[key] || key;
    },
    locale: 'es',
  }),
}));

jest.mock('@/utils/triggerHaptic', () => ({
  triggerHaptic: jest.fn(),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
  });

  it('muestra el loader con el mensaje personalizado', () => {
    mockUseOnboardingData.mockReturnValue({
      slides: [],
      texts: {
        skip: { es: 'Omitir', en: 'Skip' },
        next: { es: 'Siguiente', en: 'Next' },
        start: { es: 'Empezar', en: 'Get Started' },
      },
      isLoading: true,
      error: null,
    });

    const { getByText } = render(<OnboardingScreen />);

    expect(getByText('Cargando tutorial...')).toBeTruthy();
  });

  it('en error permite ir a inicio sin marcar onboarding visto', () => {
    mockUseOnboardingData.mockReturnValue({
      slides: [],
      texts: {
        skip: { es: 'Omitir', en: 'Skip' },
        next: { es: 'Siguiente', en: 'Next' },
        start: { es: 'Empezar', en: 'Get Started' },
      },
      isLoading: false,
      error: 'Failed',
    });

    const { getByText } = render(<OnboardingScreen />);

    fireEvent.press(getByText('Ir a inicio'));

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/(tabs)/home',
      params: { skipOnboardingCheck: 'true' },
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('en error permite reintentar el fetch', () => {
    mockUseOnboardingData.mockReturnValue({
      slides: [],
      texts: {
        skip: { es: 'Omitir', en: 'Skip' },
        next: { es: 'Siguiente', en: 'Next' },
        start: { es: 'Empezar', en: 'Get Started' },
      },
      isLoading: false,
      error: 'Failed',
    });

    const { getByText } = render(<OnboardingScreen />);

    fireEvent.press(getByText('Reintentar'));

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });
});
