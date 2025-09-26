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
const mockUseAuth = jest.fn();
jest.mock('@/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de routeConfig
jest.mock('@/components/navigation/routeConfig', () => ({
  PROTECTED_ROUTES: {
    'my-auctions': {
      requiresAuth: true,
      requiresRole: 'AUCTIONEER',
    },
    store: {
      requiresAuth: true,
    },
    account: {
      requiresAuth: true,
    },
    home: {}, // Ruta no protegida
  },
}));

describe('useAuthNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to auth when no session', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      role: null,
    });

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions');
      expect(success).toBe(false);
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/auth');
  });

  it('should block navigation when user has wrong role', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      role: 'USER', // No es AUCTIONEER
    });

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
    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      role: 'AUCTIONEER',
    });

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions');
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/my-auctions');
  });

  it('should allow navigation to routes that only require auth', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      role: 'USER', // Usuario normal
    });

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/store');
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/store');
  });

  it('should handle replace option correctly', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      role: 'USER',
    });

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/account', {
        replace: true,
      });
      expect(success).toBe(true);
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/account');
  });

  it('should block all navigation when no session (even unprotected routes)', () => {
    mockUseAuth.mockReturnValue({
      session: null, // Sin sesión
      role: null,
    });

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/home');
      expect(success).toBe(false); // El hook bloquea TODA navegación sin session
    });

    // Debe redirigir a auth, no navegar a home
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/auth');
  });
});
