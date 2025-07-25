import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { MonoText } from '../../src/components/StyledText';

it('renders correctly', () => {
  let tree;
  act(() => {
    tree = renderer.create(<MonoText>Snapshot test!</MonoText>).toJSON();
  });
  expect(tree).toMatchSnapshot();
});
