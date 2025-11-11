import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { mockSupabase } from '../../setup/mocks.mock';
import { ArticlesInfiniteScroll } from '@/components/articles/ArticlesInfiniteScroll';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

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
