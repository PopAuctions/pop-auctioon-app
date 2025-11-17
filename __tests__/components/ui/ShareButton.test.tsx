import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ShareButton } from '@/components/ui/ShareButton';

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: jest.fn(() => '/test-path'),
}));

// Mock useToast
jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    callToast: jest.fn(),
  })),
}));

describe('ShareButton', () => {
  it('renders with label', () => {
    const { getByText } = render(
      <ShareButton
        mode='primary'
        lang='en'
      >
        Share
      </ShareButton>
    );
    expect(getByText('Share')).toBeTruthy();
  });

  it('triggers press event without error', async () => {
    const { getByRole } = render(
      <ShareButton
        mode='primary'
        lang='en'
      >
        Share
      </ShareButton>
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(button).toBeTruthy();
  });
});
