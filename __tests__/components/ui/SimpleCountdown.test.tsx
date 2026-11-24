import React from 'react';
import { render } from '@testing-library/react-native';
import { SimpleCountdown } from '@/components/ui/SimpleCountdown';

describe('SimpleCountdown', () => {
  it('renders completed text when finished', () => {
    const { getByText } = render(
      <SimpleCountdown
        dateString={new Date(Date.now() - 10000).toISOString()}
        texts={{ completed: 'Done', startSoon: 'Starting soon' }}
      />
    );
    expect(getByText('Done')).toBeTruthy();
  });

  it('renders countdown when not finished', () => {
    const { getByText } = render(
      <SimpleCountdown
        dateString={new Date(Date.now() + 60000).toISOString()}
        texts={{ completed: 'Done', startSoon: 'Starting soon' }}
      />
    );
    // Should show s for seconds
    expect(getByText(/s$/)).toBeTruthy();
  });
});
