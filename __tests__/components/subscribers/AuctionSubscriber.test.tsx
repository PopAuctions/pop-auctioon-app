import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';

describe('AuctionSubscriber', () => {
  it('renders without crashing', () => {
    render(<AuctionSubscriber auctionId={1} />);
  });
});
