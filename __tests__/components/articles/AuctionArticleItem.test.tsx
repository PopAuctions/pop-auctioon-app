import React from 'react';
import { render } from '@testing-library/react-native';
import {
  mockSupabase,
  mockSafeAreaContext,
} from '@/__tests__/setup/mocks.mock';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

import { ArticleItem } from '@/components/articles/AuctionArticleItem';

describe('AuctionArticleItem', () => {
  it('renders with complete props', () => {
    const mockArticle = {
      id: 1,
      title: 'Test Article',
      images: ['https://example.com/image.jpg'],
      brand: 'LOUIS_VUITTON',
      endDate: new Date().toISOString(),
      ArticleBid: {
        currentValue: 100,
      },
    };

    const mockAuctionLang = {
      currentBid: 'Current Bid',
      follow: 'Follow',
      unfollow: 'Unfollow',
    };

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    });

    render(
      <ArticleItem
        article={mockArticle as any}
        auctionLang={mockAuctionLang}
        formatter={formatter}
        lang='en'
        userFollows={false}
        commissionValue={0.15}
      />
    );
  });
});
