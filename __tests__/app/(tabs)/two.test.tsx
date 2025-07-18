import * as React from 'react';
import renderer, { act } from 'react-test-renderer';
import TabTwoScreen from '../../../app/(tabs)/two';

describe('TabTwoScreen', () => {
  it('renders correctly', () => {
    let tree;
    act(() => {
      tree = renderer.create(<TabTwoScreen />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
