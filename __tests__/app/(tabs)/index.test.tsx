import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock de expo-router y auth-context
jest.mock('expo-router', () => ({
  Redirect: jest.fn().mockReturnValue(null),
}));

jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    session: null,
  }),
}));

import TabOneScreen from '@/app/(tabs)/index';

describe('TabOneScreen', () => {
  it('redirects to auth when no session', () => {
    render(<TabOneScreen />);

    // Verificar que Redirect fue llamado con el href correcto
    const mockExpoRouter = jest.requireMock('expo-router');
    expect(mockExpoRouter.Redirect).toHaveBeenCalled();

    // Verificar los argumentos del primer llamado
    const firstCall = mockExpoRouter.Redirect.mock.calls[0];
    expect(firstCall[0]).toEqual(
      expect.objectContaining({ href: '/(tabs)/auth' })
    );
  });

  it('should render without crashing', () => {
    // Test básico de smoke test
    expect(() => render(<TabOneScreen />)).not.toThrow();
  });
});
