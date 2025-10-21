import { renderHook, act } from '@testing-library/react-native';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { router } from 'expo-router';

// Mock de expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock de auth-context
const mockGetSession = jest.fn();
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    getSession: mockGetSession,
  }),
}));

// Mock de routeConfig
jest.mock('@/components/navigation/routeConfig', () => ({
  PROTECTED_ROUTES: {
    'my-auctions': {
      requiredRole: 'AUCTIONEER',
    },
    store: {},
    account: {},
    // home no está aquí, es ruta pública
  },
}));

describe('useAuthNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to auth when no session', () => {
    mockGetSession.mockReturnValue([null, null]);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions');
      expect(success).toBe(false);
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/auth');
  });

  it('should block navigation when user has wrong role', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions');
      expect(success).toBe(false);
    });

    // No debe navegar ni redirigir cuando el rol es incorrecto
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalledWith('/(tabs)/my-auctions');
  });

  it('should allow navigation when user has correct role', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'AUCTIONEER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions');
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/my-auctions');
  });

  it('should allow navigation to routes that only require auth', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/store');
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/store');
  });

  it('should handle replace option correctly', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/account', {
        replace: true,
      });
      expect(success).toBe(true);
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/account');
  });

  it('should allow navigation to public routes without session', () => {
    mockGetSession.mockReturnValue([null, null]);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/home');
      expect(success).toBe(true); // Home es ruta pública, permite navegación sin sesión
    });

    // No debe redirigir a auth para rutas públicas
    expect(router.replace).not.toHaveBeenCalled();
  });
});
