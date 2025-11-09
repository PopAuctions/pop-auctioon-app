import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionCountdownComponent } from '@/components/auctions/AuctionCountdownComponent';

// Mock Supabase to avoid ESM import errors
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
    },
  },
}));

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
