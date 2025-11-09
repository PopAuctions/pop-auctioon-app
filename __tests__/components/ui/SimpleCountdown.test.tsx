import React from 'react';
import { render } from '@testing-library/react-native';
import { SimpleCountdown } from '@/components/ui/SimpleCountdown';

describe('SimpleCountdown', () => {
  it('renders completed text when finished', () => {
    const { getByText } = render(
      <SimpleCountdown
        dateString={new Date(Date.now() - 10000).toISOString()}
        locale='en'
        texts={{ completed: { en: 'Done', es: 'Hecho' } }}
      />
    );
    expect(getByText('Done')).toBeTruthy();
  });

  it('renders countdown when not finished', () => {
    const { getByText } = render(
      <SimpleCountdown
        dateString={new Date(Date.now() + 60000).toISOString()}
        locale='en'
        texts={{ completed: { en: 'Done', es: 'Hecho' } }}
      />
    );
    // Should show s for seconds
    expect(getByText(/s$/)).toBeTruthy();
  });
});
