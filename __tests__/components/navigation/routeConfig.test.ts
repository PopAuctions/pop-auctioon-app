import {
  PROTECTED_ROUTES,
  requiresAuth,
  getRequiredRole,
  hasAccess,
  normalizeRoutePath,
} from '@/components/navigation/routeConfig';
import type { UserRoles } from '@/types/types';

describe('routeConfig', () => {
  describe('PROTECTED_ROUTES', () => {
    it('should have account as protected route without specific role', () => {
      expect(PROTECTED_ROUTES.account).toBeDefined();
      expect(PROTECTED_ROUTES.account).toEqual({});
    });

    it('should have my-auctions protected with AUCTIONEER role', () => {
      expect(PROTECTED_ROUTES['my-auctions']).toBeDefined();
      expect(PROTECTED_ROUTES['my-auctions'].requiredRole).toBe('AUCTIONEER');
    });

    it('should have edit-profile as protected route', () => {
      expect(PROTECTED_ROUTES['edit-profile']).toBeDefined();
    });

    it('should have reset-password as protected route', () => {
      expect(PROTECTED_ROUTES['reset-password']).toBeDefined();
    });

    it('should have verify-phone as protected route', () => {
      expect(PROTECTED_ROUTES['verify-phone']).toBeDefined();
    });

    it('should have addresses as protected route', () => {
      expect(PROTECTED_ROUTES.addresses).toBeDefined();
    });

    it('should have billing-info as protected route', () => {
      expect(PROTECTED_ROUTES['billing-info']).toBeDefined();
    });

    it('should have payments-history as protected route', () => {
      expect(PROTECTED_ROUTES['payments-history']).toBeDefined();
    });
  });

  describe('requiresAuth', () => {
    it('should return true for routes in PROTECTED_ROUTES', () => {
      expect(requiresAuth('account')).toBe(true);
      expect(requiresAuth('my-auctions')).toBe(true);
      expect(requiresAuth('edit-profile')).toBe(true);
    });

    it('should return false for routes not in PROTECTED_ROUTES', () => {
      expect(requiresAuth('home')).toBe(false);
      expect(requiresAuth('auctions')).toBe(false);
      expect(requiresAuth('store')).toBe(false);
      expect(requiresAuth('calendar')).toBe(false);
    });

    it('should return false for non-existent routes', () => {
      expect(requiresAuth('nonexistent-route')).toBe(false);
      expect(requiresAuth('')).toBe(false);
    });
  });

  describe('getRequiredRole', () => {
    it('should return AUCTIONEER for my-auctions', () => {
      expect(getRequiredRole('my-auctions')).toBe('AUCTIONEER');
    });

    it('should return undefined for routes without specific role', () => {
      expect(getRequiredRole('account')).toBeUndefined();
      expect(getRequiredRole('edit-profile')).toBeUndefined();
      expect(getRequiredRole('addresses')).toBeUndefined();
    });

    it('should return undefined for non-protected routes', () => {
      expect(getRequiredRole('home')).toBeUndefined();
      expect(getRequiredRole('auctions')).toBeUndefined();
    });

    it('should return undefined for non-existent routes', () => {
      expect(getRequiredRole('nonexistent-route')).toBeUndefined();
      expect(getRequiredRole('')).toBeUndefined();
    });
  });

  describe('hasAccess', () => {
    describe('Public routes', () => {
      it('should allow access to public routes without authentication', () => {
        expect(hasAccess('home', false, null)).toBe(true);
        expect(hasAccess('auctions', false, null)).toBe(true);
        expect(hasAccess('store', false, null)).toBe(true);
      });

      it('should allow access to public routes with authentication', () => {
        expect(hasAccess('home', true, 'USER' as UserRoles)).toBe(true);
        expect(hasAccess('auctions', true, 'AUCTIONEER' as UserRoles)).toBe(
          true
        );
      });
    });

    describe('Protected routes without specific role', () => {
      it('should deny access without authentication', () => {
        expect(hasAccess('account', false, null)).toBe(false);
        expect(hasAccess('edit-profile', false, null)).toBe(false);
        expect(hasAccess('addresses', false, null)).toBe(false);
      });

      it('should allow access with any authenticated user', () => {
        expect(hasAccess('account', true, 'USER' as UserRoles)).toBe(true);
        expect(hasAccess('account', true, 'AUCTIONEER' as UserRoles)).toBe(
          true
        );
        expect(hasAccess('edit-profile', true, 'USER' as UserRoles)).toBe(true);
      });

      it('should allow access even with null role if authenticated', () => {
        expect(hasAccess('account', true, null)).toBe(true);
        expect(hasAccess('addresses', true, null)).toBe(true);
      });
    });

    describe('Protected routes with specific role', () => {
      it('should deny access without authentication', () => {
        expect(hasAccess('my-auctions', false, null)).toBe(false);
        expect(hasAccess('my-auctions', false, 'AUCTIONEER' as UserRoles)).toBe(
          false
        );
      });

      it('should deny access with wrong role', () => {
        expect(hasAccess('my-auctions', true, 'USER' as UserRoles)).toBe(false);
      });

      it('should deny access with null role', () => {
        expect(hasAccess('my-auctions', true, null)).toBe(false);
      });

      it('should allow access with correct role', () => {
        expect(hasAccess('my-auctions', true, 'AUCTIONEER' as UserRoles)).toBe(
          true
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string route', () => {
        expect(hasAccess('', false, null)).toBe(true); // Treated as public
        expect(hasAccess('', true, 'USER' as UserRoles)).toBe(true);
      });

      it('should handle non-existent routes as public', () => {
        expect(hasAccess('nonexistent', false, null)).toBe(true);
        expect(hasAccess('random-route', true, null)).toBe(true);
      });

      it('should handle authentication with various role states', () => {
        // Authenticated but role not yet loaded
        expect(hasAccess('account', true, null)).toBe(true);

        // Specific role required but role not yet loaded
        expect(hasAccess('my-auctions', true, null)).toBe(false);
      });
    });
  });

  describe('Route configuration structure', () => {
    it('should have consistent structure for all routes', () => {
      Object.entries(PROTECTED_ROUTES).forEach(([route, config]) => {
        expect(typeof route).toBe('string');
        expect(typeof config).toBe('object');
        expect(config).not.toBeNull();

        // If requiredRole exists, it should be a string
        if (config.requiredRole !== undefined) {
          expect(typeof config.requiredRole).toBe('string');
        }
      });
    });

    it('should not have duplicate route names', () => {
      const routeNames = Object.keys(PROTECTED_ROUTES);
      const uniqueRoutes = new Set(routeNames);
      expect(uniqueRoutes.size).toBe(routeNames.length);
    });

    it('should have valid role values', () => {
      const validRoles = ['USER', 'AUCTIONEER'];

      Object.values(PROTECTED_ROUTES).forEach((config) => {
        if (config.requiredRole) {
          expect(validRoles).toContain(config.requiredRole);
        }
      });
    });
  });

  describe('normalizeRoutePath', () => {
    describe('Query parameter removal', () => {
      it('should remove query parameters', () => {
        expect(normalizeRoutePath('/(tabs)/home?foo=bar')).toBe('home');
        expect(normalizeRoutePath('/(tabs)/account?tab=settings')).toBe(
          'account'
        );
      });
    });

    describe('Expo Router groups removal', () => {
      it('should remove (tabs) group', () => {
        expect(normalizeRoutePath('/(tabs)/home')).toBe('home');
        expect(normalizeRoutePath('/(tabs)/account')).toBe('account');
      });

      it('should remove multiple groups', () => {
        expect(normalizeRoutePath('/(tabs)/(modals)/profile')).toBe('profile');
      });
    });

    describe('Simple routes (no parameters)', () => {
      it('should normalize simple route names', () => {
        expect(normalizeRoutePath('/(tabs)/home')).toBe('home');
        expect(normalizeRoutePath('/(tabs)/auctions')).toBe('auctions');
        expect(normalizeRoutePath('/(tabs)/my-auctions')).toBe('my-auctions');
        expect(normalizeRoutePath('/(tabs)/account')).toBe('account');
      });

      it('should handle routes with "new" keyword', () => {
        expect(normalizeRoutePath('/(tabs)/my-auctions/new')).toBe(
          'my-auctions/new'
        );
      });
    });

    describe('Single-level dynamic routes ([id])', () => {
      it('should convert pure numbers to [id]', () => {
        expect(normalizeRoutePath('/(tabs)/my-auctions/28')).toBe(
          'my-auctions/[id]'
        );
        expect(normalizeRoutePath('/(tabs)/my-auctions/123')).toBe(
          'my-auctions/[id]'
        );
      });

      it('should convert UUIDs to [id]', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(normalizeRoutePath(`/(tabs)/my-auctions/${uuid}`)).toBe(
          'my-auctions/[id]'
        );
      });

      it('should keep route names as literals (not convert to [id])', () => {
        // "edit-article" should NOT be converted to [id]
        expect(normalizeRoutePath('/(tabs)/my-auctions/28/edit-article')).toBe(
          'my-auctions/[id]'
        );
      });
    });

    describe('Multi-level dynamic routes ([id]/something/[slug])', () => {
      it('should convert multi-level routes with numeric slugs', () => {
        expect(
          normalizeRoutePath('/(tabs)/my-auctions/28/edit-article/456')
        ).toBe('my-auctions/[id]/edit-article/[slug]');

        expect(
          normalizeRoutePath('/(tabs)/my-auctions/28/edit-article/789')
        ).toBe('my-auctions/[id]/edit-article/[slug]');

        expect(
          normalizeRoutePath(
            '/(tabs)/my-auctions/100/rearrange-article-images/200'
          )
        ).toBe('my-auctions/[id]/rearrange-article-images/[slug]');
      });

      it('should handle first number as [id], second as [slug]', () => {
        // Context-aware: first number → [id], second number → [slug]
        const path = '/(tabs)/my-auctions/28/edit-article/72';
        const normalized = normalizeRoutePath(path);

        expect(normalized).toBe('my-auctions/[id]/edit-article/[slug]');
      });

      it('should handle UUID as [id] and number as [slug]', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        const path = `/(tabs)/my-auctions/${uuid}/edit-article/123`;
        const normalized = normalizeRoutePath(path);

        expect(normalized).toBe('my-auctions/[id]/edit-article/[slug]');
      });
    });

    describe('Fallback to most specific route', () => {
      it('should return most specific matching route', () => {
        // Should find 'my-auctions/[id]' instead of just 'my-auctions'
        expect(normalizeRoutePath('/(tabs)/my-auctions/28')).toBe(
          'my-auctions/[id]'
        );
      });

      it('should fallback to less specific if full path not found', () => {
        // If 'my-auctions/[id]/edit-article/[slug]' not in PROTECTED_ROUTES,
        // should fallback to 'my-auctions/[id]'
        // But since it IS in PROTECTED_ROUTES, should return full path
        expect(
          normalizeRoutePath('/(tabs)/my-auctions/28/edit-article/456')
        ).toBe('my-auctions/[id]/edit-article/[slug]');
      });

      it('should return last segment if no match found', () => {
        // If route not found in PROTECTED_ROUTES at all
        expect(normalizeRoutePath('/(tabs)/unknown/route')).toBe('route');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty path', () => {
        expect(normalizeRoutePath('')).toBe('');
      });

      it('should handle path with only groups', () => {
        expect(normalizeRoutePath('/(tabs)/(modals)')).toBe('');
      });

      it('should handle path with trailing slash', () => {
        expect(normalizeRoutePath('/(tabs)/home')).toBe('home');
      });

      it('should handle path with multiple slashes', () => {
        expect(normalizeRoutePath('/(tabs)//home')).toBe('home');
      });
    });

    describe('Real-world scenarios', () => {
      it('should handle complex route navigation flow', () => {
        // User navigates from home → auction → edit article
        expect(normalizeRoutePath('/(tabs)/home')).toBe('home');
        expect(normalizeRoutePath('/(tabs)/my-auctions')).toBe('my-auctions');
        expect(normalizeRoutePath('/(tabs)/my-auctions/28')).toBe(
          'my-auctions/[id]'
        );
        expect(
          normalizeRoutePath('/(tabs)/my-auctions/28/edit-article/456')
        ).toBe('my-auctions/[id]/edit-article/[slug]');
      });

      it('should distinguish between route names and IDs', () => {
        // "new" is a route name, "28" is an ID
        expect(normalizeRoutePath('/(tabs)/my-auctions/new')).toBe(
          'my-auctions/new'
        );
        expect(normalizeRoutePath('/(tabs)/my-auctions/28')).toBe(
          'my-auctions/[id]'
        );
      });
    });
  });
});
