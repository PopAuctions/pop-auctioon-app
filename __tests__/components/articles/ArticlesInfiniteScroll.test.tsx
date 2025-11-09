import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ArticlesInfiniteScroll } from '@/components/articles/ArticlesInfiniteScroll';

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

describe('ArticlesInfiniteScroll', () => {
  it('renders without crashing', () => {
    render(
      <ArticlesInfiniteScroll
        lang='en'
        auctionId={1}
        ListHeaderComponent={<Text>Header</Text>}
        articlesFollowed={[]}
      />
    );
  });
});
