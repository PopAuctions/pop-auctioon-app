import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';

// Mock Share
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.defineProperty(RN, 'Share', {
    value: {
      share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
    },
  });
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: jest.fn(() => '/test-path'),
}));

// Mock useToast
const mockCallToast = jest.fn();
jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    callToast: mockCallToast,
  })),
}));

describe('ShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with children', () => {
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

  it('calls Share.share with correct payload when pressed', async () => {
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

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
    });
  });

  it('triggers haptic feedback when pressed', async () => {
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

    await waitFor(() => {
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  it('generates smart share URL with locale', async () => {
    const { getByRole } = render(
      <ShareButton
        mode='primary'
        lang='es'
      >
        Share
      </ShareButton>
    );

    const button = getByRole('button');
    fireEvent.press(button);

    await waitFor(() => {
      const callArgs = (Share.share as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toContain('locale=es');
    });
  });

  it('uses custom title when provided', async () => {
    const { getByRole } = render(
      <ShareButton
        mode='primary'
        lang='en'
        title={{ es: 'Compartir esto', en: 'Share this' }}
      >
        Share
      </ShareButton>
    );

    const button = getByRole('button');
    fireEvent.press(button);

    await waitFor(() => {
      const callArgs = (Share.share as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toContain('Share this');
    });
  });

  it('shows error toast when share fails', async () => {
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share failed'));

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

    await waitFor(() => {
      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: {
          es: 'Hubo un error al compartir',
          en: 'There was an error sharing',
        },
      });
    });
  });
});
