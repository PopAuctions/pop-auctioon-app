import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionCountdownComponent } from '@/components/auctions/AuctionCountdownComponent';

describe('AuctionCountdownComponent', () => {
  it('renders without crashing', () => {
    render(<AuctionCountdownComponent endDate={new Date().toISOString()} />);
  });
});
