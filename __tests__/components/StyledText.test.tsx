import * as React from 'react';
import { render } from '@testing-library/react-native';

import { MonoText } from '../../src/components/StyledText';

describe('MonoText Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MonoText>Snapshot test!</MonoText>);

    // Verificar que el texto se renderiza correctamente
    expect(getByText('Snapshot test!')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<MonoText>Snapshot test!</MonoText>);

    // Mantener el snapshot test usando la librería recomendada
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render without crashing', () => {
    // Test básico de smoke test
    expect(() => render(<MonoText>Test content</MonoText>)).not.toThrow();
  });
});
