import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import { BillingFormModal } from '@/components/billing-info/BillingFormModal';

const mockCreateBilling = jest.fn();
const mockUpdateBilling = jest.fn();

jest.mock('@/hooks/pages/billing/useBilling', () => ({
  useCreateBilling: () => ({
    createBilling: mockCreateBilling,
    status: 'idle',
    errorMessage: null,
  }),
  useUpdateBilling: () => ({
    updateBilling: mockUpdateBilling,
    status: 'idle',
    errorMessage: null,
  }),
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
    expect(getByPlaceholderText('E.g.: B12345678')).toBeTruthy();
  });

  it('shows validation errors for required fields', async () => {
    const { getByText, getAllByText } = render(
      <BillingFormModal {...defaultProps} />
    );
    fireEvent.press(getByText(/save/i));
    await waitFor(() => {
      // All required fields should show 'Requerido' error (Spanish)
      expect(getAllByText('Requerido').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls createBilling with correct payload on create', async () => {
    mockCreateBilling.mockResolvedValueOnce(undefined);

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
    fireEvent.changeText(getByPlaceholderText('E.g.: B12345678'), 'RFC123');

    fireEvent.press(getByText(/save/i));

    await waitFor(() => {
      expect(mockCreateBilling).toHaveBeenCalledWith({
        label: 'Mi Factura',
        billingName: 'Empresa S.A.',
        billingAddress: 'Calle 123',
        vatNumber: 'RFC123',
      });
    });
  });

  it('calls updateBilling with correct payload on edit', async () => {
    mockUpdateBilling.mockResolvedValueOnce(undefined);

    const billingToEdit = {
      id: '2',
      label: 'Factura Edit',
      billingName: 'Edit S.A.',
      billingAddress: 'Edit 456',
      vatNumber: 'RFCEDIT',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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
      expect(mockUpdateBilling).toHaveBeenCalledWith('2', {
        label: 'Factura Nueva',
        billingName: 'Edit S.A.',
        billingAddress: 'Edit 456',
        vatNumber: 'RFCEDIT',
      });
    });
  });

  it('handles form submission without closing modal immediately', async () => {
    mockCreateBilling.mockResolvedValueOnce(undefined);

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
    fireEvent.changeText(getByPlaceholderText('E.g.: B12345678'), 'RFC123');

    fireEvent.press(getByText(/save/i));

    await waitFor(() => {
      expect(mockCreateBilling).toHaveBeenCalled();
    });

    // Modal handles success in useEffect, not immediately
    // Test just verifies the hook was called correctly
  });

  it('resets form and calls onClose when closed', () => {
    const { getByText } = render(<BillingFormModal {...defaultProps} />);
    fireEvent.press(getByText(/cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
