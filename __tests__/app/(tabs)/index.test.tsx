import * as React from 'react';
import renderer, { act } from 'react-test-renderer';
import TabOneScreen from '@/app/(tabs)/index';

describe('TabOneScreen', () => {
  it('renders correctly', () => {
    let tree;
    act(() => {
      tree = renderer.create(<TabOneScreen />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
