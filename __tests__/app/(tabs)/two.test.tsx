import * as React from 'react';
import renderer from 'react-test-renderer';
import TabTwoScreen from '../../../app/(tabs)/two';

describe('TabTwoScreen', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<TabTwoScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
