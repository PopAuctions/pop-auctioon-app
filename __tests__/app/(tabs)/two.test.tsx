import * as React from 'react';
import { render } from '@testing-library/react-native';
import TabTwoScreen from '../../../app/(tabs)/two';

describe('TabTwoScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<TabTwoScreen />);

    // Verificar que el texto principal se renderiza
    expect(getByText('Tab Two')).toBeTruthy();
    expect(getByText('Press me')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<TabTwoScreen />);

    // Mantener el snapshot test usando la librería recomendada
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render without crashing', () => {
    // Test básico de smoke test
    expect(() => render(<TabTwoScreen />)).not.toThrow();
  });
});
