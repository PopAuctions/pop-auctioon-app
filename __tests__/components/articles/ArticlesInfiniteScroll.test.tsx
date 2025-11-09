import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticlesInfiniteScroll } from '@/components/articles/ArticlesInfiniteScroll';

describe('ArticlesInfiniteScroll', () => {
  it('renders without crashing', () => {
    render(<ArticlesInfiniteScroll articles={[]} />);
  });
});
