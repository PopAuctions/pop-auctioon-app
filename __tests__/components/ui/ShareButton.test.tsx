import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ShareButton } from '@/components/ui/ShareButton';

describe('ShareButton', () => {
  it('renders with label', () => {
    const { getByText } = render(
      <ShareButton mode='primary'>Share</ShareButton>
    );
    expect(getByText('Share')).toBeTruthy();
  });

  it('triggers press event without error', () => {
    const { getByRole } = render(
      <ShareButton mode='primary'>Share</ShareButton>
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(button).toBeTruthy();
  });
});
