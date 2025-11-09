/**
 * User role constants
 * Use these instead of magic strings to prevent typos and improve type safety
 */
export const APP_USER_ROLES = {
  USER: 'USER',
  AUCTIONEER: 'AUCTIONEER',
} as const;

/**
 * Type for app user roles
 */
export type AppUserRole = (typeof APP_USER_ROLES)[keyof typeof APP_USER_ROLES];

/**
 * Type guard to check if a string is a valid app user role
 */
export const isValidAppUserRole = (role: string): role is AppUserRole => {
  return Object.values(APP_USER_ROLES).includes(role as any);
};
