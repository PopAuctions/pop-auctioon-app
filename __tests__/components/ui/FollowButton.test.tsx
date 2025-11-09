import React from 'react';
import { render } from '@testing-library/react-native';
import { mockSupabase } from '@/__tests__/setup/mocks.mock';

jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

import { FollowButton } from '@/components/ui/FollowButton';

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
