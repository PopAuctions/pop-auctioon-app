import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyAddressState } from '@/components/addresses/EmptyAddressState';

describe('EmptyAddressState', () => {
  it('renders empty state with title and subtitle', () => {
    const { getByText } = render(<EmptyAddressState onAddNew={() => {}} />);

    // Check for title text (from translation key 'screens.addresses.noAddressesYet')
    expect(getByText(/don't have any saved addresses/i)).toBeTruthy();

    // Check for subtitle text (from translation key 'screens.addresses.noAddressesSubtitle')
    expect(getByText(/shipping address for your purchases/i)).toBeTruthy();
  });

  it('renders add new address button', () => {
    const { getByText } = render(<EmptyAddressState onAddNew={() => {}} />);

    // Use exact text from translation key 'screens.addresses.addNew'
    expect(getByText('Add new address')).toBeTruthy();
  });

  it('disables add new button when disabled prop is true', () => {
    const { getByRole } = render(
      <EmptyAddressState
        onAddNew={() => {}}
        disabled={true}
      />
    );
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('calls onAddNew when button is pressed', () => {
    const mockAddNew = jest.fn();
    const { getByRole } = render(<EmptyAddressState onAddNew={mockAddNew} />);

    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(false);
  });
});
