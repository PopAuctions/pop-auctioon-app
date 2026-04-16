import React from 'react';
import { render } from '@testing-library/react-native';
import { Divider } from '@/components/ui/Divider';

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    const { toJSON } = render(<Divider />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders vertical divider', () => {
    const { toJSON } = render(<Divider orientation='vertical' />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('applies custom className', () => {
    const { toJSON } = render(<Divider className='bg-red-500' />);
    expect(toJSON()).toMatchSnapshot();
  });
});
