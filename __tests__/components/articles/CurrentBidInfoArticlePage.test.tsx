import React from 'react';
import { render } from '@testing-library/react-native';
import { CurrentBidInfoArticlePage } from '@/components/articles/CurrentBidInfoArticlePage';
import { HighestBidderProvider } from '@/context/highest-bidder-context';

// Mock SimpleCountdown to avoid timer issues in tests
jest.mock('@/components/ui/SimpleCountdown', () => {
  const mockReact = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return {
    SimpleCountdown: () => mockReact.createElement(Text, {}, '5d 3h 20m 15s'),
  };
});

describe('CurrentBidInfoArticlePage', () => {
  it('renders current bid info with all props', () => {
    const { getByText } = render(
      <HighestBidderProvider>
        <CurrentBidInfoArticlePage
          lang='en'
          currentValue={100}
          estimatedValue={200}
          reservePrice={150}
          commissionValue={15}
          texts={{
            highestBid: 'Highest Bid',
            estimatedValue: 'Estimated Value',
            reservePrice: 'Reserve Price',
            commission: 'Commission',
            shipping: 'Shipping',
            price: 'Price',
          }}
        />
      </HighestBidderProvider>
    );
    expect(getByText('Highest Bid')).toBeTruthy();
    expect(getByText(/Estimated Value/)).toBeTruthy();
  });

  it('renders without reserve price', () => {
    const { queryByText } = render(
      <HighestBidderProvider>
        <CurrentBidInfoArticlePage
          lang='en'
          currentValue={100}
          estimatedValue={200}
          reservePrice={null}
          commissionValue={15}
          texts={{
            highestBid: 'Highest Bid',
            estimatedValue: 'Estimated Value',
            reservePrice: 'Reserve Price',
            commission: 'Commission',
            shipping: 'Shipping',
            price: 'Price',
          }}
        />
      </HighestBidderProvider>
    );
    expect(queryByText('Reserve Price')).toBeNull();
  });
});
