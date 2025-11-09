import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '../../setup/mocks.mock';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

describe('AuctionSubscriber', () => {
  it('renders without crashing', () => {
    render(<AuctionSubscriber auctionId={1} />);
  });
});
