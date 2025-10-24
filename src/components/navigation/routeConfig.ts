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
  'edit-profile': {},
  'reset-password': {},
  'verify-phone': {},
  addresses: {},
  'billing-info': {},
  'payments-history': {},
  'articles-won': {},

  // Rutas que requieren LOGIN + rol específico
  'my-auctions': {
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
