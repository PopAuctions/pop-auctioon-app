import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { ArticleItem } from '@/components/articles/AuctionArticleItem';

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

// Mock SafeAreaProvider with displayName
const mockSafeAreaProvider = ({ children }: any) => <View>{children}</View>;
mockSafeAreaProvider.displayName = 'SafeAreaProvider';

const mockSafeAreaView = ({ children }: any) => <View>{children}</View>;
mockSafeAreaView.displayName = 'SafeAreaView';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: mockSafeAreaProvider,
  SafeAreaView: mockSafeAreaView,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  initialWindowMetrics: {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  },
}));

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
