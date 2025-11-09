import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '../../setup/mocks.mock';
import { ArticleBidsRecord } from '@/components/articles/ArticleBidsRecord';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

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
