import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionArticleItem } from '@/components/articles/AuctionArticleItem';

describe('AuctionArticleItem', () => {
  it('renders without crashing', () => {
    render(
      <AuctionArticleItem article={{ id: '1', title: 'Test', price: 100 }} />
    );
  });
});
