import * as React from 'react';
import renderer from 'react-test-renderer';
import TabOneScreen from '../../../app/(tabs)/index';

describe('TabOneScreen', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<TabOneScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
