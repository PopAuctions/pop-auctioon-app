import {
  getParentRoute,
  shouldBuildStack,
} from '@/utils/deeplinks/getParentRoute';

describe('getParentRoute', () => {
  describe('Account Routes', () => {
    it('should return parent route for account/edit-profile', () => {
      const result = getParentRoute('/(tabs)/account/edit-profile');
      expect(result).toBe('/(tabs)/account');
    });

    it('should return parent route for account/addresses', () => {
      const result = getParentRoute('/(tabs)/account/addresses');
      expect(result).toBe('/(tabs)/account');
    });

    it('should return parent route for account/billing-info', () => {
      const result = getParentRoute('/(tabs)/account/billing-info');
      expect(result).toBe('/(tabs)/account');
    });

    it('should return parent route for deeply nested account route', () => {
      const result = getParentRoute('/(tabs)/account/settings/notifications');
      expect(result).toBe('/(tabs)/account');
    });

    it('should return null for root account route', () => {
      const result = getParentRoute('/(tabs)/account');
      expect(result).toBeNull();
    });
  });

  describe('Auctions Routes', () => {
    it('should return parent route for auctions/123', () => {
      const result = getParentRoute('/(tabs)/auctions/123');
      expect(result).toBe('/(tabs)/auctions');
    });

    it('should return parent route for auctions/live/456', () => {
      const result = getParentRoute('/(tabs)/auctions/live/456');
      expect(result).toBe('/(tabs)/auctions');
    });

    it('should return parent route for auctions/calendar', () => {
      const result = getParentRoute('/(tabs)/auctions/calendar');
      expect(result).toBe('/(tabs)/auctions');
    });

    it('should return null for root auctions route', () => {
      const result = getParentRoute('/(tabs)/auctions');
      expect(result).toBeNull();
    });
  });

  describe('My Auctions Routes', () => {
    it('should return parent route for my-auctions/123', () => {
      const result = getParentRoute('/(tabs)/my-auctions/123');
      expect(result).toBe('/(tabs)/my-auctions');
    });

    it('should return parent route for my-auctions/new', () => {
      const result = getParentRoute('/(tabs)/my-auctions/new');
      expect(result).toBe('/(tabs)/my-auctions');
    });

    it('should return parent route for my-auctions/old', () => {
      const result = getParentRoute('/(tabs)/my-auctions/old');
      expect(result).toBe('/(tabs)/my-auctions');
    });

    it('should return null for root my-auctions route', () => {
      const result = getParentRoute('/(tabs)/my-auctions');
      expect(result).toBeNull();
    });
  });

  describe('Online Store Routes', () => {
    it('should return parent route for online-store/products/789', () => {
      const result = getParentRoute('/(tabs)/online-store/products/789');
      expect(result).toBe('/(tabs)/online-store');
    });

    it('should return parent route for online-store/categories', () => {
      const result = getParentRoute('/(tabs)/online-store/categories');
      expect(result).toBe('/(tabs)/online-store');
    });

    it('should return null for root online-store route', () => {
      const result = getParentRoute('/(tabs)/online-store');
      expect(result).toBeNull();
    });
  });

  describe('My Online Store Routes', () => {
    it('should return parent route for my-online-store/inventory', () => {
      const result = getParentRoute('/(tabs)/my-online-store/inventory');
      expect(result).toBe('/(tabs)/my-online-store');
    });

    it('should return parent route for my-online-store/orders', () => {
      const result = getParentRoute('/(tabs)/my-online-store/orders');
      expect(result).toBe('/(tabs)/my-online-store');
    });

    it('should return null for root my-online-store route', () => {
      const result = getParentRoute('/(tabs)/my-online-store');
      expect(result).toBeNull();
    });
  });

  describe('Auth Routes', () => {
    it('should return parent route for auth/register', () => {
      const result = getParentRoute('/(tabs)/auth/register');
      expect(result).toBe('/(tabs)/auth');
    });

    it('should return parent route for auth/login', () => {
      const result = getParentRoute('/(tabs)/auth/login');
      expect(result).toBe('/(tabs)/auth');
    });

    it('should return null for root auth route', () => {
      const result = getParentRoute('/(tabs)/auth');
      expect(result).toBeNull();
    });
  });

  describe('Home Routes', () => {
    it('should return null for root home route', () => {
      const result = getParentRoute('/(tabs)/home');
      expect(result).toBeNull();
    });

    it('should return parent route if home has nested routes', () => {
      const result = getParentRoute('/(tabs)/home/details');
      expect(result).toBe('/(tabs)/home');
    });
  });

  describe('Path Format Variations', () => {
    it('should handle paths without leading slash', () => {
      const result = getParentRoute('(tabs)/account/edit-profile');
      expect(result).toBe('/(tabs)/account');
    });

    it('should handle paths without (tabs) prefix', () => {
      const result = getParentRoute('/account/edit-profile');
      expect(result).toBe('/(tabs)/account');
    });

    it('should handle paths without both slash and (tabs)', () => {
      const result = getParentRoute('account/edit-profile');
      expect(result).toBe('/(tabs)/account');
    });

    it('should handle paths with query parameters', () => {
      const result = getParentRoute('/(tabs)/auctions/123?filter=active');
      expect(result).toBe('/(tabs)/auctions');
    });

    it('should handle paths with hash fragments', () => {
      const result = getParentRoute('/(tabs)/account/settings#notifications');
      expect(result).toBe('/(tabs)/account');
    });
  });

  describe('Edge Cases', () => {
    it('should return null for empty string', () => {
      const result = getParentRoute('');
      expect(result).toBeNull();
    });

    it('should return null for just (tabs)', () => {
      const result = getParentRoute('/(tabs)');
      expect(result).toBeNull();
    });

    it('should return null for unknown tab route', () => {
      const result = getParentRoute('/(tabs)/unknown-tab/nested');
      expect(result).toBeNull();
    });

    it('should return null for path without any slashes after tab', () => {
      const result = getParentRoute('/(tabs)/home/');
      expect(result).toBeNull();
    });
  });
});

describe('shouldBuildStack', () => {
  describe('Returns true for nested routes', () => {
    it('should return true for account nested route', () => {
      const result = shouldBuildStack('/(tabs)/account/edit-profile');
      expect(result).toBe(true);
    });

    it('should return true for auctions nested route', () => {
      const result = shouldBuildStack('/(tabs)/auctions/123');
      expect(result).toBe(true);
    });

    it('should return true for my-auctions nested route', () => {
      const result = shouldBuildStack('/(tabs)/my-auctions/new');
      expect(result).toBe(true);
    });

    it('should return true for online-store nested route', () => {
      const result = shouldBuildStack('/(tabs)/online-store/products/789');
      expect(result).toBe(true);
    });

    it('should return true for my-online-store nested route', () => {
      const result = shouldBuildStack('/(tabs)/my-online-store/inventory');
      expect(result).toBe(true);
    });

    it('should return true for auth nested route', () => {
      const result = shouldBuildStack('/(tabs)/auth/register');
      expect(result).toBe(true);
    });

    it('should return true for deeply nested route', () => {
      const result = shouldBuildStack('/(tabs)/account/settings/notifications');
      expect(result).toBe(true);
    });
  });

  describe('Returns false for root tab routes', () => {
    it('should return false for root home', () => {
      const result = shouldBuildStack('/(tabs)/home');
      expect(result).toBe(false);
    });

    it('should return false for root auctions', () => {
      const result = shouldBuildStack('/(tabs)/auctions');
      expect(result).toBe(false);
    });

    it('should return false for root online-store', () => {
      const result = shouldBuildStack('/(tabs)/online-store');
      expect(result).toBe(false);
    });

    it('should return false for root my-auctions', () => {
      const result = shouldBuildStack('/(tabs)/my-auctions');
      expect(result).toBe(false);
    });

    it('should return false for root my-online-store', () => {
      const result = shouldBuildStack('/(tabs)/my-online-store');
      expect(result).toBe(false);
    });

    it('should return false for root account', () => {
      const result = shouldBuildStack('/(tabs)/account');
      expect(result).toBe(false);
    });

    it('should return false for root auth', () => {
      const result = shouldBuildStack('/(tabs)/auth');
      expect(result).toBe(false);
    });
  });

  describe('Returns false for invalid/unknown routes', () => {
    it('should return false for empty string', () => {
      const result = shouldBuildStack('');
      expect(result).toBe(false);
    });

    it('should return false for unknown tab', () => {
      const result = shouldBuildStack('/(tabs)/unknown-tab/nested');
      expect(result).toBe(false);
    });

    it('should return false for just (tabs)', () => {
      const result = shouldBuildStack('/(tabs)');
      expect(result).toBe(false);
    });
  });
});
