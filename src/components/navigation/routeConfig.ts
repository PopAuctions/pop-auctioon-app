import { UserRoles } from '@/types/types';

export interface RouteConfig {
  requiresAuth: boolean;
  requiresRole?: UserRoles;
}

/**
 * Configuración centralizada de rutas protegidas
 *
 * - requiresAuth: true = Requiere estar loggeado
 * - requiresRole: Rol específico requerido
 *
 * ROLES DISPONIBLES:
 * - 'USER': Usuario regular (puede ver subastas, comprar en store, gestionar cuenta)
 * - 'AUCTIONEER': Subastador (puede crear/gestionar subastas + todo lo de USER)
 */
export const PROTECTED_ROUTES: Record<string, RouteConfig> = {
  // Rutas que requieren LOGIN (cualquier rol)
  account: {
    requiresAuth: true,
  },
  auctions: {
    requiresAuth: true,
  },
  // Rutas que requieren LOGIN + rol específico
  'my-auctions': {
    requiresAuth: true,
    requiresRole: 'AUCTIONEER',
  },

  // Ejemplo de rutas futuras:
  // 'admin-panel': {
  //   requiresAuth: true,
  //   requiresRole: 'ADMIN',
  // },
  // 'notifications': {
  //   requiresAuth: true,
  // },
};

/**
 * Helper para verificar si una ruta requiere autenticación
 */
export const requiresAuth = (routeName: string): boolean => {
  return PROTECTED_ROUTES[routeName]?.requiresAuth || false;
};

/**
 * Helper para verificar si una ruta requiere un rol específico
 */
export const requiresRole = (routeName: string): UserRoles | undefined => {
  return PROTECTED_ROUTES[routeName]?.requiresRole;
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

  if (config.requiresAuth && !isAuthenticated) {
    // Requiere auth pero no está loggeado
    return false;
  }

  if (config.requiresRole && userRole !== config.requiresRole) {
    // Requiere rol específico pero no lo tiene
    return false;
  }

  return true;
};
