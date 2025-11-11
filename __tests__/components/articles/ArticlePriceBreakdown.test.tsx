import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticlePriceBreakdown } from '@/components/articles/ArticlePriceBreakdown';

describe('ArticlePriceBreakdown', () => {
  it('renders price breakdown with all props', () => {
    const { getByText } = render(
      <ArticlePriceBreakdown
        lang='en'
        price={100}
        commissionValue={0.15}
        texts={{
          commission: 'Commission',
          shipping: 'Shipping',
          price: 'Price',
        }}
      />
    );
    // With price=100 and commissionValue=0.15 (15%)
    // Commissioned price = Math.round(100 * 1.15) = 115
    expect(getByText('€115')).toBeTruthy();
  });

  it('renders with zero commission', () => {
    const { getByText } = render(
      <ArticlePriceBreakdown
        lang='en'
        price={200}
        commissionValue={0}
        texts={{
          commission: 'Commission',
          shipping: 'Shipping',
          price: 'Price',
        }}
      />
    );
    // With zero commission, price stays the same
    expect(getByText('€200')).toBeTruthy();
  });
});
