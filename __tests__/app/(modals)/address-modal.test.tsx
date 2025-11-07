import React from 'react';
import { render } from '@testing-library/react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import AddressFormScreen from '@/app/(modals)/address-modal';

// Mock all dependencies
jest.mock('@/hooks/i18n/useTranslation');
jest.mock('@/components/addresses/AddressFormModal');
jest.mock('expo-router');
jest.mock('expo-status-bar');

const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

describe('AddressFormScreen (Modal)', () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: mockT as any,
      locale: 'en',
      changeLanguage: jest.fn(),
      isPending: false,
    });
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { root } = render(<AddressFormScreen />);
      expect(root).toBeTruthy();
    });

    it('should call translation hook', () => {
      render(<AddressFormScreen />);
      expect(mockUseTranslation).toHaveBeenCalled();
    });

    it('should request translation for addNew key', () => {
      render(<AddressFormScreen />);
      expect(mockT).toHaveBeenCalledWith('screens.addresses.addNew');
    });
  });
});
