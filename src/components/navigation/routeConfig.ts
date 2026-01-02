import { UserRoles } from '@/types/types';

export interface RouteConfig {
  requiredRole?: UserRoles | null;
}

/**
 * Configuración centralizada de rutas protegidas
 *
 * Si una ruta está en este objeto, requiere autenticación.
 * - requiredRole: undefined/null = Cualquier usuario autenticado
 * - requiredRole: 'ROLE' = Solo ese rol específico
 *
 * ROLES DISPONIBLES:
 * - 'USER': Usuario regular (puede ver subastas, comprar en store, gestionar cuenta)
 * - 'AUCTIONEER': Subastador (puede crear/gestionar subastas + todo lo de USER)
 */
export const PROTECTED_ROUTES: Record<string, RouteConfig> = {
  // Rutas que requieren LOGIN (cualquier rol)
  account: {},
  'account-user': {},
  addresses: {},
  'articles-won': {},
  'billing-info': {},
  'edit-profile': {},
  'followed-auctions': {},
  'followed-articles': {},
  'offers-made': {},
  'payments-history': {},
  'verify-phone': {},
  'payment/[id]': {},

  // Rutas que requieren LOGIN + rol específico
  'my-auctions': {
    requiredRole: 'AUCTIONEER',
  },
  'my-auctions/old': {
    requiredRole: 'AUCTIONEER',
  },
  'my-auctions/new': {
    requiredRole: 'AUCTIONEER',
  },
  'my-auctions/[id]': {
    requiredRole: 'AUCTIONEER',
  },
  'my-auctions/[id]/new-article': {
    requiredRole: 'AUCTIONEER',
  },
  'my-auctions/[id]/edit-article/[slug]': {
    requiredRole: 'AUCTIONEER',
  },
  'my-auctions/[id]/rearrange-article-images/[slug]': {
    requiredRole: 'AUCTIONEER',
  },

  // Ejemplo de rutas futuras:
  // 'admin-panel': {
  //   requiredRole: 'ADMIN',
  // },
  // 'notifications': {},  // Cualquier usuario autenticado
};

/**
 * Helper para verificar si una ruta requiere autenticación
 */
export const requiresAuth = (routeName: string): boolean => {
  return routeName in PROTECTED_ROUTES;
};

/**
 * Helper para obtener el rol requerido de una ruta
 */
export const getRequiredRole = (
  routeName: string
): UserRoles | null | undefined => {
  return PROTECTED_ROUTES[routeName]?.requiredRole;
};

/**
 * Helper para verificar si un usuario tiene acceso a una ruta
 */
export const hasAccess = (
  routeName: string,
  isAuthenticated: boolean,
  userRole: UserRoles | null
): boolean => {
  const config = PROTECTED_ROUTES[routeName];

  if (!config) {
    // Ruta no protegida = acceso libre
    return true;
  }

  // Si está en PROTECTED_ROUTES, requiere autenticación
  if (!isAuthenticated) {
    return false;
  }

  // Si requiere rol específico, verificar que coincida
  if (config.requiredRole && userRole !== config.requiredRole) {
    return false;
  }

  return true;
};

/**
 * Normaliza una ruta con parámetros dinámicos a su patrón en PROTECTED_ROUTES
 *
 * Convierte rutas reales con IDs/slugs a sus patrones con [id]/[slug]:
 * - '/(tabs)/my-auctions/28' → 'my-auctions/[id]'
 * - '/(tabs)/my-auctions/28/edit-article/789' → 'my-auctions/[id]/edit-article/[slug]'
 * - '/(tabs)/account/edit-profile' → 'edit-profile'
 * - '/(tabs)/auctions/live/123' → 'auctions/live/[id]'
 *
 * ESTRATEGIA CONSERVADORA: Solo convertir a [id]/[slug] valores que CLARAMENTE son datos,
 * no nombres de rutas. Por defecto, mantener literal (más seguro).
 *
 * @param path - Ruta completa con grupos y parámetros (ej: '/(tabs)/my-auctions/28/edit-article/abc')
 * @returns Patrón normalizado que matchea con PROTECTED_ROUTES
 */
export const normalizeRoutePath = (path: string): string => {
  // 1. Remover query params
  const cleanPath = path.split('?')[0];

  // 2. Split y remover grupos de expo-router como (tabs), (modals), etc.
  const parts = cleanPath
    .split('/')
    .filter((part) => part && !part.includes('(') && !part.includes(')'));

  // 3. Detectar SOLO parámetros dinámicos (datos reales) con patrones muy específicos
  // CONTEXTO: Si ya vimos un [id], el siguiente número será [slug]
  // IMPORTANTE: Los slugs siempre son números en este proyecto
  let hasSeenId = false;

  const normalized = parts.map((part) => {
    // ✅ PATRÓN 1: Número puro → [id] o [slug] según contexto
    // Ejemplos: '28' → [id], '456' → [slug] (si ya hay un [id])
    if (/^\d+$/.test(part)) {
      if (hasSeenId) {
        // Ya hay un [id] antes → este es [slug]
        return '[slug]';
      }
      hasSeenId = true;
      return '[id]';
    }

    // ✅ PATRÓN 2: UUID estándar
    // Ejemplo: '550e8400-e29b-41d4-a716-446655440000'
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        part
      )
    ) {
      if (hasSeenId) {
        return '[slug]';
      }
      hasSeenId = true;
      return '[id]';
    }

    // ❌ Si no matchea ningún patrón específico de datos → mantener literal
    // Esto incluye nombres de rutas como: 'edit-article', 'new', 'old', 'create', etc.
    return part;
  });

  // 4. Buscar en PROTECTED_ROUTES de más específico a más genérico
  // Ejemplo: para ['my-auctions', '[id]', 'edit-article', '[slug]'], busca:
  //   - 'my-auctions/[id]/edit-article/[slug]' primero (más específico)
  //   - 'my-auctions/[id]/edit-article' después
  //   - 'my-auctions/[id]' después
  //   - 'my-auctions' al final (más genérico)
  for (let i = normalized.length; i > 0; i--) {
    const candidate = normalized.slice(0, i).join('/');
    if (candidate in PROTECTED_ROUTES) {
      return candidate;
    }
  }

  // Si no se encuentra nada, retornar la última parte (comportamiento fallback)
  return normalized[normalized.length - 1] || '';
};
