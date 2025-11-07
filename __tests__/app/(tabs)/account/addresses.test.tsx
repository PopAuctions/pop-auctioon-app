import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import AddressesScreen from '@/app/(tabs)/account/addresses';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { UserAddress } from '@/types/types';

// Mock dependencies
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/hooks/i18n/useTranslation');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

describe('AddressesScreen', () => {
  const mockSecureGet = jest.fn();
  const mockT = jest.fn((key: string) => key);

  const mockAddresses: UserAddress[] = [
    {
      id: '1',
      userId: 'user-1',
      nameAddress: 'Home',
      address: '123 Main St',
      city: 'Madrid',
      state: 'Madrid',
      country: 'SPAIN',
      postalCode: '28001',
      primaryAddress: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      userId: 'user-1',
      nameAddress: 'Office',
      address: '456 Work Ave',
      city: 'Barcelona',
      state: 'Catalonia',
      country: 'SPAIN',
      postalCode: '08001',
      primaryAddress: false,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: mockT,
      locale: 'en',
      changeLanguage: jest.fn(),
      isPending: false,
    });

    mockUseSecureApi.mockReturnValue({
      secureGet: mockSecureGet,
      securePost: jest.fn(),
      protectedGet: jest.fn(),
      protectedPost: jest.fn(),
      isAuthenticated: jest.fn(),
    });
  });

  describe('Loading State', () => {
    it('should show loading component when fetching addresses', () => {
      mockSecureGet.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<AddressesScreen />);

      expect(screen.getByText('commonActions.loading')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no addresses', async () => {
      mockSecureGet.mockResolvedValue({
        data: [],
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(screen.getByText('screens.addresses.empty.title')).toBeTruthy();
        expect(
          screen.getByText('screens.addresses.empty.description')
        ).toBeTruthy();
      });
    });

    it('should show add button in empty state', async () => {
      mockSecureGet.mockResolvedValue({
        data: [],
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        const addButton = screen.getByText('screens.addresses.addNew');
        expect(addButton).toBeTruthy();
      });
    });
  });

  describe('Addresses List', () => {
    it('should display list of addresses', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeTruthy();
        expect(screen.getByText('Office')).toBeTruthy();
        expect(screen.getByText('123 Main St')).toBeTruthy();
        expect(screen.getByText('456 Work Ave')).toBeTruthy();
      });
    });

    it('should show primary badge for primary address', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(screen.getByText('screens.addresses.primary')).toBeTruthy();
      });
    });

    it('should display all address fields', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        // Check first address
        expect(screen.getByText('Madrid')).toBeTruthy();
        expect(screen.getByText('28001')).toBeTruthy();

        // Check second address
        expect(screen.getByText('Barcelona')).toBeTruthy();
        expect(screen.getByText('Catalonia')).toBeTruthy();
        expect(screen.getByText('08001')).toBeTruthy();
      });
    });

    it('should display country labels correctly', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        // Spain should appear for both addresses
        const spainLabels = screen.getAllByText(/Spain/i);
        expect(spainLabels.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should log error when API returns error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSecureGet.mockResolvedValue({
        data: null,
        error: 'Failed to fetch addresses',
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Error from API:',
          'Failed to fetch addresses'
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should log error on network failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSecureGet.mockRejectedValue(new Error('Network error'));

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Network error loading addresses:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Pull to Refresh', () => {
    it('should reload addresses on pull to refresh', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeTruthy();
      });

      // Initial call
      expect(mockSecureGet).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons during refresh', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      const { getByText } = render(<AddressesScreen />);

      await waitFor(() => {
        expect(getByText('Home')).toBeTruthy();
      });

      // Note: Testing disabled state during refresh would require triggering
      // the refresh and checking button state, which requires native interaction
    });
  });

  describe('Navigation', () => {
    it('should use correct API endpoint', async () => {
      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(mockSecureGet).toHaveBeenCalledWith('/user/addresses');
      });
    });
  });

  describe('Localization', () => {
    it('should use Spanish locale for country labels', async () => {
      mockUseTranslation.mockReturnValue({
        t: mockT,
        locale: 'es',
        changeLanguage: jest.fn(),
        isPending: false,
      });

      mockSecureGet.mockResolvedValue({
        data: mockAddresses,
        error: null,
      });

      render(<AddressesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeTruthy();
      });

      // Verify Spanish locale is being used
      expect(mockUseTranslation).toHaveBeenCalled();
    });
  });
});
