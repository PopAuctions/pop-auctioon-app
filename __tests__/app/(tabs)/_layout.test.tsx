import * as React from 'react';
import renderer from 'react-test-renderer';
import TabLayout from '../../../app/(tabs)/_layout';

describe('TabLayout', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<TabLayout />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
