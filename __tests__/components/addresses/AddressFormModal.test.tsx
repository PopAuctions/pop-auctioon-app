import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '../../setup/mocks.mock';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

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
    // Check for specific form field label that's unique
    expect(getByText('Save address')).toBeTruthy();
  });

  it('does not render modal when not visible', () => {
    const { queryByText } = render(
      <AddressFormModal
        visible={false}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    );
    expect(queryByText('Save address')).toBeNull();
  });
});
