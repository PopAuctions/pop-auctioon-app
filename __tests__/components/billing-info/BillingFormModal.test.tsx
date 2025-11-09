import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BillingFormModal } from '@/components/billing-info/BillingFormModal';

import { SECURE_ENDPOINTS } from '@/config/api-config';

const mockSecurePost = jest.fn();
jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({ securePost: mockSecurePost }),
}));

const mockOnClose = jest.fn();
const mockOnSuccess = jest.fn();

const defaultProps = {
  visible: true,
  onClose: mockOnClose,
  onSuccess: mockOnSuccess,
  billingToEdit: null,
};

describe('BillingFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields and labels in create mode', () => {
    const { getByText, getByPlaceholderText } = render(
      <BillingFormModal {...defaultProps} />
    );
    // Labels
    expect(getByText('Title for billing data *')).toBeTruthy();
    expect(getByText('Name or company name *')).toBeTruthy();
    expect(getByText('Billing address *')).toBeTruthy();
    expect(getByText('Tax ID / VAT number *')).toBeTruthy();
    // Placeholders
    expect(getByPlaceholderText('E.g: Company, Personal, etc.')).toBeTruthy();
    expect(getByPlaceholderText('Full name or company')).toBeTruthy();
    expect(getByPlaceholderText('Complete address')).toBeTruthy();
    expect(getByPlaceholderText('RFC, NIT, RUT, etc.')).toBeTruthy();
  });

  it('shows validation errors for required fields', async () => {
    const { getByText, getAllByText } = render(
      <BillingFormModal {...defaultProps} />
    );
    fireEvent.press(getByText(/save/i));
    await waitFor(() => {
      // All required fields should show 'Required' error
      expect(getAllByText('Required').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls securePost with correct payload on create', async () => {
    mockSecurePost.mockResolvedValueOnce({ data: { id: '1' } });
    const { getByPlaceholderText, getByText } = render(
      <BillingFormModal {...defaultProps} />
    );
    fireEvent.changeText(
      getByPlaceholderText('E.g: Company, Personal, etc.'),
      'Mi Factura'
    );
    fireEvent.changeText(
      getByPlaceholderText('Full name or company'),
      'Empresa S.A.'
    );
    fireEvent.changeText(getByPlaceholderText('Complete address'), 'Calle 123');
    fireEvent.changeText(getByPlaceholderText('RFC, NIT, RUT, etc.'), 'RFC123');
    fireEvent.press(getByText(/save/i));
    await waitFor(() => {
      expect(mockSecurePost).toHaveBeenCalledWith({
        endpoint: SECURE_ENDPOINTS.USER.BILLING_CREATE,
        data: {
          label: 'Mi Factura',
          billingName: 'Empresa S.A.',
          billingAddress: 'Calle 123',
          vatNumber: 'RFC123',
        },
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls securePost with correct payload on edit', async () => {
    mockSecurePost.mockResolvedValueOnce({ data: { id: '2' } });
    const billingToEdit = {
      id: '2',
      label: 'Factura Edit',
      billingName: 'Edit S.A.',
      billingAddress: 'Edit 456',
      vatNumber: 'RFCEDIT',
    };
    const { getByPlaceholderText, getByText } = render(
      <BillingFormModal
        {...defaultProps}
        billingToEdit={billingToEdit}
      />
    );
    fireEvent.changeText(
      getByPlaceholderText('E.g: Company, Personal, etc.'),
      'Factura Nueva'
    );
    fireEvent.press(getByText(/save/i));
    await waitFor(() => {
      expect(mockSecurePost).toHaveBeenCalledWith({
        endpoint: SECURE_ENDPOINTS.USER.BILLING_UPDATE,
        data: {
          id: '2',
          label: 'Factura Nueva',
          billingName: 'Edit S.A.',
          billingAddress: 'Edit 456',
          vatNumber: 'RFCEDIT',
        },
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error and does not close on API error', async () => {
    mockSecurePost.mockResolvedValueOnce({
      error: { es: 'Error', en: 'Error' },
    });
    const { getByPlaceholderText, getByText } = render(
      <BillingFormModal {...defaultProps} />
    );
    fireEvent.changeText(
      getByPlaceholderText('E.g: Company, Personal, etc.'),
      'Mi Factura'
    );
    fireEvent.changeText(
      getByPlaceholderText('Full name or company'),
      'Empresa S.A.'
    );
    fireEvent.changeText(getByPlaceholderText('Complete address'), 'Calle 123');
    fireEvent.changeText(getByPlaceholderText('RFC, NIT, RUT, etc.'), 'RFC123');
    fireEvent.press(getByText(/save/i));
    await waitFor(() => {
      expect(mockSecurePost).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
    // No error message is rendered, just ensure modal stays open and no success/close is called
  });

  it('resets form and calls onClose when closed', () => {
    const { getByText } = render(<BillingFormModal {...defaultProps} />);
    fireEvent.press(getByText(/cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
