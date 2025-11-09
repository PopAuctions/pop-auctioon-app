import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '../../setup/mocks.mock';

import { AuctionCountdownComponent } from '@/components/auctions/AuctionCountdownComponent';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

describe('AuctionCountdownComponent', () => {
  it('renders without crashing', () => {
    const mockAuctionLang = {
      follow: 'Follow',
      unfollow: 'Unfollow',
      share: 'Share',
      articles: 'Articles',
      currentBid: 'Current Bid',
      estimatedPrice: 'Estimated Price',
      waiting1: 'Auction will start soon!',
      waiting2: 'Wait a few minutes',
      start: 'Auction already started!',
      finished: 'Auction finished',
      watchButton: 'Watch live',
      ended: 'Auction finished',
      timeStart: 'Time to start:',
      auctionNotFound: 'Auction not found',
      noArticlesFound: 'No articles found',
      specialMessage: 'No commission',
    };

    render(
      <AuctionCountdownComponent
        dateString={new Date().toISOString()}
        id={1}
        locale='en'
        auctionLang={mockAuctionLang}
        auctionMode='AUTOMATIC'
      />
    );
  });
});
