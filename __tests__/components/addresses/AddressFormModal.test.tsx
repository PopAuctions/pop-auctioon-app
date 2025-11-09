import React from 'react';
import { render } from '@testing-library/react-native';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';

describe('AddressFormModal', () => {
  it('renders modal when visible', () => {
    const { getByText } = render(
      <AddressFormModal
        visible={true}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    );
    // The translation key is 'screens.addresses.form.title', but we check for any text
    expect(getByText(/address/i)).toBeTruthy();
  });

  it('does not render modal when not visible', () => {
    const { queryByText } = render(
      <AddressFormModal
        visible={false}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    );
    expect(queryByText(/address/i)).toBeNull();
  });
});
