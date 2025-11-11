import React from 'react';
import { render } from '@testing-library/react-native';
import { AddressCard } from '@/components/addresses/AddressCard';

describe('AddressCard', () => {
  const baseAddress = {
    id: '1',
    nameAddress: 'Home',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'US',
    postalCode: '10001',
    primaryAddress: false,
    created_at: null,
    userId: 'user-1',
  };

  it('renders address card with all fields', () => {
    const { getByText } = render(
      <AddressCard
        address={baseAddress}
        countryLabel='United States'
      />
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('123 Main St')).toBeTruthy();
    expect(getByText('New York, NY')).toBeTruthy();
    expect(getByText('United States')).toBeTruthy();
    expect(getByText('10001')).toBeTruthy();
  });

  it('renders primary address badge if primaryAddress is true', () => {
    const { getByText } = render(
      <AddressCard
        address={{ ...baseAddress, primaryAddress: true }}
        countryLabel='United States'
      />
    );
    // The translation key is 'screens.addresses.primary', but we check for any text
    expect(getByText(/primary/i)).toBeTruthy();
  });
});
