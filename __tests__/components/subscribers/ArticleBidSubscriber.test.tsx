import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '../../setup/mocks.mock';
import { ArticleBidSubscriber } from '@/components/subscribers/ArticleBidSubscriber';
import { HighestBidderProvider } from '@/context/highest-bidder-context';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

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
