import React from 'react';
import { render } from '@testing-library/react-native';
import { FollowButton } from '@/components/ui/FollowButton';

// Mock Supabase to avoid ESM import errors
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
    },
  },
}));

describe('FollowButton', () => {
  it('renders follow label when not following', () => {
    const { getByText } = render(
      <FollowButton
        mode='primary'
        followEndpoint='/follow'
        unfollowEndpoint='/unfollow'
        follows={false}
        lang='en'
        extraDataIsLoaded={true}
      />
    );
    expect(getByText('Follow')).toBeTruthy();
  });

  it('renders unfollow label when following', () => {
    const { getByText } = render(
      <FollowButton
        mode='primary'
        followEndpoint='/follow'
        unfollowEndpoint='/unfollow'
        follows={true}
        lang='en'
        extraDataIsLoaded={true}
      />
    );
    expect(getByText('Unfollow')).toBeTruthy();
  });

  it('disables button when not available', () => {
    const { getByRole } = render(
      <FollowButton
        mode='primary'
        followEndpoint='/follow'
        unfollowEndpoint='/unfollow'
        follows={false}
        lang='en'
        isAvailable={true}
        extraDataIsLoaded={true}
      />
    );
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
