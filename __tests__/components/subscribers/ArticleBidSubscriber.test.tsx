import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleBidSubscriber } from '@/components/subscribers/ArticleBidSubscriber';

describe('ArticleBidSubscriber', () => {
  it('renders without crashing', () => {
    render(<ArticleBidSubscriber bidId={1} />);
  });
});
