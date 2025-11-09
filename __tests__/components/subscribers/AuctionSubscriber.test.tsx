import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';

// Mock Supabase to avoid ESM import errors
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
    },
    getChannels: jest.fn(() => []),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  },
}));

describe('AuctionSubscriber', () => {
  it('renders without crashing', () => {
    render(<AuctionSubscriber auctionId={1} />);
  });
});
