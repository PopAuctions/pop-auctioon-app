import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleBidsRecord } from '@/components/articles/ArticleBidsRecord';

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

describe('ArticleBidsRecord', () => {
  it('renders without crashing', () => {
    render(
      <ArticleBidsRecord
        articleId={1}
        lang='en'
        initialPrice={100}
      />
    );
  });
});
