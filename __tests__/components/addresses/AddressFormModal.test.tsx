/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { mockSupabase } from '../../setup/mocks.mock';
import { SECURE_ENDPOINTS } from '@/config/api-config';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Picker: Object.assign(
      ({ children, onValueChange, selectedValue }: any) => {
        return <View testID='picker'>{children}</View>;
      },
      {
        Item: ({ label, value }: any) => null,
      }
    ),
  };
});

const mockSecurePost = jest.fn();
jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({
    securePost: mockSecurePost,
  }),
}));

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
  }),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('AddressFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when visible', () => {
      const { getByText } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );
      expect(getByText('screens.addresses.form.title')).toBeTruthy();
    });

    it('does not render modal when not visible', () => {
      const { queryByText } = render(
        <AddressFormModal
          visible={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );
      expect(queryByText('screens.addresses.form.title')).toBeNull();
    });

    it('renders all form labels', () => {
      const { getByText } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );
      expect(getByText('screens.addresses.form.nameAddress')).toBeTruthy();
      expect(getByText('screens.addresses.form.address')).toBeTruthy();
      expect(getByText('screens.addresses.form.city')).toBeTruthy();
      expect(getByText('screens.addresses.form.state')).toBeTruthy();
      expect(getByText('screens.addresses.form.postalCode')).toBeTruthy();
    });

    it('renders submit and cancel buttons', () => {
      const { getByText } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );
      expect(getByText('screens.addresses.form.submit')).toBeTruthy();
      expect(getByText('screens.addresses.form.cancel')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('does not submit when form is empty', async () => {
      const { getByText } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(
        () => {
          expect(mockSecurePost).not.toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });
  });

  describe('API Integration', () => {
    it('calls securePost with CREATE_ADDRESS endpoint on successful submission', async () => {
      mockSecurePost.mockResolvedValueOnce({ data: { success: true } });

      const { getByText, getAllByDisplayValue } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const inputs = getAllByDisplayValue('');
      expect(inputs.length).toBeGreaterThanOrEqual(5);

      fireEvent.changeText(inputs[0], 'Home Address');
      fireEvent.changeText(inputs[1], '123 Main Street');
      fireEvent.changeText(inputs[2], 'New York');
      fireEvent.changeText(inputs[3], 'NY');
      fireEvent.changeText(inputs[4], '10001');

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSecurePost).toHaveBeenCalledWith({
          endpoint: SECURE_ENDPOINTS.USER.CREATE_ADDRESS,
          data: expect.objectContaining({
            nameAddress: 'Home Address',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            primaryAddress: false,
          }),
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles API error response correctly', async () => {
      mockSecurePost.mockResolvedValueOnce({
        error: {
          en: 'Failed to create address',
          es: 'Error al crear direcci�n',
        },
      });

      const { getByText, getAllByDisplayValue } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const inputs = getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], 'Home Address');
      fireEvent.changeText(inputs[1], '123 Main Street');
      fireEvent.changeText(inputs[2], 'New York');
      fireEvent.changeText(inputs[3], 'NY');
      fireEvent.changeText(inputs[4], '10001');

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSecurePost).toHaveBeenCalledTimes(1);
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('includes primaryAddress flag when checkbox is checked', async () => {
      mockSecurePost.mockResolvedValueOnce({ data: { success: true } });

      const { getByText, getAllByDisplayValue, getByRole } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const inputs = getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], 'Home Address');
      fireEvent.changeText(inputs[1], '123 Main Street');
      fireEvent.changeText(inputs[2], 'New York');
      fireEvent.changeText(inputs[3], 'NY');
      fireEvent.changeText(inputs[4], '10001');

      const checkbox = getByRole('checkbox');
      fireEvent(checkbox, 'onValueChange', true);

      const submitButton = getByText('screens.addresses.form.submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSecurePost).toHaveBeenCalledWith({
          endpoint: SECURE_ENDPOINTS.USER.CREATE_ADDRESS,
          data: expect.objectContaining({
            primaryAddress: true,
          }),
        });
      });
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when cancel button is pressed', () => {
      const { getByText } = render(
        <AddressFormModal
          visible={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = getByText('screens.addresses.form.cancel');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
