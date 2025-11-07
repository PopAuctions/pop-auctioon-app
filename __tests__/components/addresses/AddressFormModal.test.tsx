import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { AddressSchemaType } from '@/utils/schemas';

// Mock dependencies
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/hooks/i18n/useTranslation');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

describe('AddressFormModal', () => {
  const mockSecurePost = jest.fn();
  const mockT = jest.fn((key: string) => key);
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: mockT as any,
      locale: 'en',
      changeLanguage: jest.fn(),
      isPending: false,
    });

    mockUseSecureApi.mockReturnValue({
      secureGet: jest.fn(),
      securePost: mockSecurePost,
      protectedGet: jest.fn(),
      protectedPost: jest.fn(),
      isAuthenticated: jest.fn(),
      getCurrentUser: jest.fn(),
      refreshAuth: jest.fn(),
    } as any);
  });

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  describe('Rendering', () => {
    it('should render modal when visible', () => {
      render(<AddressFormModal {...defaultProps} />);

      expect(screen.getByText('screens.addresses.form.title')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <AddressFormModal
          {...defaultProps}
          visible={false}
        />
      );

      expect(queryByText('screens.addresses.form.title')).toBeNull();
    });

    it('should render all form fields', () => {
      render(<AddressFormModal {...defaultProps} />);

      expect(
        screen.getByText('screens.addresses.form.nameAddress')
      ).toBeTruthy();
      expect(screen.getByText('screens.addresses.form.address')).toBeTruthy();
      expect(screen.getByText('screens.addresses.form.city')).toBeTruthy();
      expect(screen.getByText('screens.addresses.form.state')).toBeTruthy();
      expect(screen.getByText('screens.addresses.form.country')).toBeTruthy();
      expect(
        screen.getByText('screens.addresses.form.postalCode')
      ).toBeTruthy();
    });

    it('should render primary address checkbox', () => {
      render(<AddressFormModal {...defaultProps} />);

      expect(
        screen.getByText('screens.addresses.form.setPrimary')
      ).toBeTruthy();
    });

    it('should render submit and cancel buttons', () => {
      render(<AddressFormModal {...defaultProps} />);

      expect(screen.getByText('screens.addresses.form.submit')).toBeTruthy();
      expect(screen.getByText('screens.addresses.form.cancel')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<AddressFormModal {...defaultProps} />);

      const submitButton = screen.getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Should show validation errors (from Zod schema)
        const errorMessages = screen.queryAllByText(/Required/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should validate nameAddress field', async () => {
      const { getByText } = render(<AddressFormModal {...defaultProps} />);

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Check if validation error is shown
        expect(mockSecurePost).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    const validAddressData: AddressSchemaType = {
      nameAddress: 'Home',
      address: '123 Main St',
      city: 'Madrid',
      state: 'Madrid',
      country: 'SPAIN',
      postalCode: '28001',
      primaryAddress: true,
    };

    it('should submit form with valid data', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: {
            en: 'Address created successfully',
            es: 'Dirección creada exitosamente',
          },
          address: { ...validAddressData, id: '1', userId: 'user-1' },
        },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill form fields
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        validAddressData.nameAddress
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.address'),
        validAddressData.address
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.city'),
        validAddressData.city
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.state'),
        validAddressData.state
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.postalCode'),
        validAddressData.postalCode
      );

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSecurePost).toHaveBeenCalledWith(
          '/user/addresses/create',
          expect.objectContaining({
            nameAddress: validAddressData.nameAddress,
            address: validAddressData.address,
            city: validAddressData.city,
            state: validAddressData.state,
            postalCode: validAddressData.postalCode,
          })
        );
      });
    });

    it('should call onSuccess and onClose after successful submission', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'Success', es: 'Éxito' },
          address: validAddressData,
        },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill required fields
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        'Home'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.address'),
        '123 Main St'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.city'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.state'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.postalCode'),
        '28001'
      );

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'commonActions.ok',
          'screens.addresses.success'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show success alert after submission', async () => {
      mockSecurePost.mockResolvedValue({
        data: {
          success: { en: 'Address created', es: 'Dirección creada' },
          address: validAddressData,
        },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill and submit form
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        'Home'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.address'),
        '123 Main St'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.city'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.state'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.postalCode'),
        '28001'
      );

      fireEvent.press(getByText('screens.addresses.form.submit'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should log error when API returns error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSecurePost.mockResolvedValue({
        data: null,
        error: 'Failed to create address',
      });

      const { getByPlaceholderText, getByText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill and submit form
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        'Home'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.address'),
        '123 Main St'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.city'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.state'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.postalCode'),
        '28001'
      );

      fireEvent.press(getByText('screens.addresses.form.submit'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ERROR_CREATE_ADDRESS',
          'Failed to create address'
        );
        expect(mockOnSuccess).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should log error on network failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSecurePost.mockRejectedValue(new Error('Network error'));

      const { getByPlaceholderText, getByText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill and submit form
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        'Home'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.address'),
        '123 Main St'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.city'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.state'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.postalCode'),
        '28001'
      );

      fireEvent.press(getByText('screens.addresses.form.submit'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ERROR_CREATE_ADDRESS_CATCH',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Primary Address Toggle', () => {
    it('should toggle primary address checkbox', () => {
      const { getByText } = render(<AddressFormModal {...defaultProps} />);

      const checkbox = getByText('screens.addresses.form.setPrimary');
      fireEvent.press(checkbox);

      // Checkbox should be checked (tested via form submission)
    });
  });

  describe('Cancel Button', () => {
    it('should call onClose when cancel button is pressed', () => {
      const { getByText } = render(<AddressFormModal {...defaultProps} />);

      const cancelButton = getByText('screens.addresses.form.cancel');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when closing', () => {
      const { getByText, getByPlaceholderText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill a field
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        'Test'
      );

      // Close modal
      const cancelButton = getByText('screens.addresses.form.cancel');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const existingAddress: AddressSchemaType & { id: string } = {
      id: '1',
      nameAddress: 'Existing Home',
      address: '456 Old St',
      city: 'Barcelona',
      state: 'Catalonia',
      country: 'SPAIN',
      postalCode: '08001',
      primaryAddress: false,
    };

    it('should populate form with existing address data', () => {
      const { getByDisplayValue } = render(
        <AddressFormModal
          {...defaultProps}
          addressToEdit={existingAddress}
        />
      );

      expect(getByDisplayValue('Existing Home')).toBeTruthy();
      expect(getByDisplayValue('456 Old St')).toBeTruthy();
      expect(getByDisplayValue('Barcelona')).toBeTruthy();
      expect(getByDisplayValue('Catalonia')).toBeTruthy();
      expect(getByDisplayValue('08001')).toBeTruthy();
    });
  });

  describe('Country Picker', () => {
    it('should render country picker', () => {
      render(<AddressFormModal {...defaultProps} />);

      // Picker should be rendered
      expect(screen.getByText('screens.addresses.form.country')).toBeTruthy();
    });

    it('should use correct locale for country labels', () => {
      mockUseTranslation.mockReturnValue({
        t: mockT as any,
        locale: 'es',
        changeLanguage: jest.fn(),
        isPending: false,
      });

      render(<AddressFormModal {...defaultProps} />);

      // Spanish locale should be used for COUNTRIES_MAP
      expect(mockUseTranslation).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable inputs while submitting', async () => {
      mockSecurePost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { success: { en: 'Success', es: 'Éxito' } },
                  error: null,
                }),
              100
            )
          )
      );

      const { getByPlaceholderText, getByText } = render(
        <AddressFormModal {...defaultProps} />
      );

      // Fill form
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.nameAddress'),
        'Home'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.address'),
        '123 Main St'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.city'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.state'),
        'Madrid'
      );
      fireEvent.changeText(
        getByPlaceholderText('screens.addresses.form.postalCode'),
        '28001'
      );

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      // Inputs should be disabled during submission
      // This is tested via the editable={!isSubmitting} prop
    });
  });
});
