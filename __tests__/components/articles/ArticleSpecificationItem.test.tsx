import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleSpecificationItem } from '@/components/articles/ArticleSpecificationItem';

describe('ArticleSpecificationItem', () => {
  it('renders without crashing', () => {
    render(
      <ArticleSpecificationItem
        label='Color'
        value='Rojo'
      />
    );
  });
});
