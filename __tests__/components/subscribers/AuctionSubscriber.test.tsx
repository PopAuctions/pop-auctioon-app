import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '../../setup/mocks.mock';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

// Mock de useIsFocused desde react-navigation
jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn(() => true),
}));

describe('AuctionSubscriber', () => {
  it('renders without crashing', () => {
    render(
      <AuctionSubscriber
        auctionId={1}
        compareTo='ACTIVE'
      />
    );
  });
});
