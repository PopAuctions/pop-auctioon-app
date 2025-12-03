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
    'my-auctions/[id]': {
      requiredRole: 'AUCTIONEER',
    },
    'my-auctions/[id]/articles/[slug]': {
      requiredRole: 'AUCTIONEER',
    },
    'my-auctions/[id]/edit-article/[slug]': {
      requiredRole: 'AUCTIONEER',
    },
    'my-auctions/[id]/rearrange-article-images/[slug]': {
      requiredRole: 'AUCTIONEER',
    },
    'my-auctions/new': {
      requiredRole: 'AUCTIONEER',
    },
    'auctions/live/[id]': {},
    store: {},
    account: {},
    'edit-profile': {},
    // home no está aquí, es ruta pública
  },
  // Mock de normalizeRoutePath que simula la conversión de IDs/slugs usando patrones
  normalizeRoutePath: (path: string) => {
    const cleanPath = path.split('?')[0];
    const parts = cleanPath
      .split('/')
      .filter((part) => part && !part.includes('(') && !part.includes(')'));

    let hasSeenId = false;

    const normalized = parts.map((part) => {
      // Número puro → [id] o [slug] según contexto
      if (/^\d+$/.test(part)) {
        if (hasSeenId) {
          return '[slug]';
        }
        hasSeenId = true;
        return '[id]';
      }

      // UUID → [id] o [slug] según contexto
      if (
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
          part
        )
      ) {
        if (hasSeenId) {
          return '[slug]';
        }
        hasSeenId = true;
        return '[id]';
      }

      return part;
    });

    const ROUTES = {
      'my-auctions': true,
      'my-auctions/[id]': true,
      'my-auctions/[id]/articles/[slug]': true,
      'my-auctions/[id]/edit-article/[slug]': true,
      'my-auctions/[id]/rearrange-article-images/[slug]': true,
      'my-auctions/new': true,
      'auctions/live/[id]': true,
      store: true,
      account: true,
      'edit-profile': true,
    };

    // Buscar de más específico a menos específico
    for (let i = normalized.length; i > 0; i--) {
      const candidate = normalized.slice(0, i).join('/');
      if (ROUTES[candidate as keyof typeof ROUTES]) {
        return candidate;
      }
    }

    // Fallback
    return normalized[normalized.length - 1] || '';
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

  // ✨ TESTS PARA RUTAS DINÁMICAS CON [id]
  it('should handle dynamic route my-auctions/[id] with AUCTIONEER role', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'AUCTIONEER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions/28');
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/my-auctions/28');
  });

  it('should block dynamic route my-auctions/[id] for USER role', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth('/(tabs)/my-auctions/28');
      expect(success).toBe(false);
    });

    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('should allow dynamic route auctions/live/[id] for any authenticated user', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth(
        '/(tabs)/auctions/live/123'
      );
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/auctions/live/123');
  });

  it('should block dynamic route auctions/live/[id] without session', () => {
    mockGetSession.mockReturnValue([null, null]);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth(
        '/(tabs)/auctions/live/123'
      );
      expect(success).toBe(false);
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/auth');
  });

  it('should handle multi-level route my-auctions/[id]/articles/[slug] with AUCTIONEER', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'AUCTIONEER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      // Slug numérico: los slugs siempre son números
      const success = result.current.navigateWithAuth(
        '/(tabs)/my-auctions/28/articles/456'
      );
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith(
      '/(tabs)/my-auctions/28/articles/456'
    );
  });

  it('should block multi-level route my-auctions/[id]/articles/[slug] for USER role', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth(
        '/(tabs)/my-auctions/28/articles/456'
      );
      expect(success).toBe(false);
    });

    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('should handle multi-level route with numeric slug my-auctions/[id]/edit-article/[slug]', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'AUCTIONEER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      // Slug numérico: '789' debe convertirse en [slug], no [id]
      const success = result.current.navigateWithAuth(
        '/(tabs)/my-auctions/28/edit-article/789'
      );
      expect(success).toBe(true);
    });

    expect(router.push).toHaveBeenCalledWith(
      '/(tabs)/my-auctions/28/edit-article/789'
    );
  });

  it('should block multi-level route with numeric slug for USER role', () => {
    mockGetSession.mockReturnValue([{ user: { id: '123' } }, 'USER']);

    const { result } = renderHook(() => useAuthNavigation());

    act(() => {
      const success = result.current.navigateWithAuth(
        '/(tabs)/my-auctions/28/edit-article/789'
      );
      expect(success).toBe(false);
    });

    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });
});
