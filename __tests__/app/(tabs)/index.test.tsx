import * as React from 'react';
import { render } from '@testing-library/react-native';
import TabOneScreen from '@/app/(tabs)/index';

// Mock de expo-router y auth-context
jest.mock('expo-router', () => ({
  Redirect: jest.fn().mockReturnValue(null),
}));

const mockUseAuth = jest.fn();
jest.mock('@/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('TabOneScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to auth when no session', () => {
    mockUseAuth.mockReturnValue({
      session: null,
    });

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

  it('should redirect to home when session exists', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } }, // Con sesión
      role: 'USER',
    });

    render(<TabOneScreen />);

    // Verificar que Redirect fue llamado con href hacia home
    const mockExpoRouter = jest.requireMock('expo-router');
    expect(mockExpoRouter.Redirect).toHaveBeenCalled();

    // Verificar los argumentos del primer llamado
    const firstCall = mockExpoRouter.Redirect.mock.calls[0];
    expect(firstCall[0]).toEqual(
      expect.objectContaining({ href: '/(tabs)/home' })
    );
  });

  it('should render without crashing', () => {
    // Test básico de smoke test
    expect(() => render(<TabOneScreen />)).not.toThrow();
  });
});
