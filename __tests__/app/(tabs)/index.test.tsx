import * as React from 'react';
import { render } from '@testing-library/react-native';
import TabOneScreen from '@/app/(tabs)/index';

describe('TabOneScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<TabOneScreen />);

    // Verificar que el texto principal se renderiza
    expect(getByText('Tab One POPPINS')).toBeTruthy();
    expect(getByText('Inter Black HELLO')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<TabOneScreen />);

    // Mantener el snapshot test usando la librería recomendada
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render without crashing', () => {
    // Test básico de smoke test
    expect(() => render(<TabOneScreen />)).not.toThrow();
  });
});
