import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleBidSubscriber } from '@/components/subscribers/ArticleBidSubscriber';
import { HighestBidderProvider } from '@/context/highest-bidder-context';

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

describe('ArticleBidSubscriber', () => {
  it('renders without crashing', () => {
    render(
      <HighestBidderProvider>
        <ArticleBidSubscriber
          articleId={1}
          onFirstBid={() => {}}
        />
      </HighestBidderProvider>
    );
  });
});
