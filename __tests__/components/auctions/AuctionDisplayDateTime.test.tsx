import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';

describe('AuctionDisplayDateTime', () => {
  it('renders without crashing', () => {
    render(<AuctionDisplayDateTime date={new Date().toISOString()} />);
  });
});
