import React from 'react';
import { render } from '@testing-library/react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';

describe('FontAwesomeIcon', () => {
  it('renders normal variant (FontAwesome5)', () => {
    const { toJSON } = render(
      <FontAwesomeIcon
        name='star'
        size={24}
        color='#000'
        variant='normal'
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders light variant (FontAwesome6)', () => {
    const { toJSON } = render(
      <FontAwesomeIcon
        name='star'
        size={24}
        color='#000'
        variant='light'
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders bold variant (FontAwesome)', () => {
    const { toJSON } = render(
      <FontAwesomeIcon
        name='star'
        size={24}
        color='#000'
        variant='bold'
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders with cinnabar color', () => {
    const { toJSON } = render(
      <FontAwesomeIcon
        name='star'
        size={24}
        color='cinnabar'
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
