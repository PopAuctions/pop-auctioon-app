import { SECURE_ENDPOINTS, PROTECTED_ENDPOINTS } from '@/config/api-config';

describe('API Config - User Endpoints', () => {
  describe('SECURE_ENDPOINTS.USER', () => {
    it('should have correct user endpoints structure', () => {
      expect(SECURE_ENDPOINTS.USER).toBeDefined();
      expect(typeof SECURE_ENDPOINTS.USER).toBe('object');
    });

    it('should have PROFILE endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.PROFILE).toBe('/user/profile');
    });

    it('should have UPDATE_PROFILE endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.UPDATE_PROFILE).toBe('/user/update-profile');
    });

    it('should have EDIT_INFO endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.EDIT_INFO).toBe('/user/edit-user-info');
    });

    it('should have ADDRESSES endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.ADDRESSES).toBe('/user/addresses');
    });

    it('should have CREATE_ADDRESS endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.CREATE_ADDRESS).toBe(
        '/user/addresses/create'
      );
    });

    it('should have PREFERENCES endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.PREFERENCES).toBe('/user/preferences');
    });

    it('should have HISTORY endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.HISTORY).toBe('/user/history');
    });

    it('should have FAVORITES endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.FAVORITES).toBe('/user/favorites');
    });
  });

  describe('Endpoint Consistency', () => {
    it('should prefix all user endpoints with /user/', () => {
      const userEndpoints = Object.values(SECURE_ENDPOINTS.USER).filter(
        (endpoint) => typeof endpoint === 'string'
      );

      userEndpoints.forEach((endpoint) => {
        expect(endpoint).toMatch(/^\/user\//);
      });
    });

    it('should not have trailing slashes', () => {
      const allSecureEndpoints = Object.values(SECURE_ENDPOINTS).flatMap(
        (group) => (typeof group === 'object' ? Object.values(group) : [group])
      );

      allSecureEndpoints.forEach((endpoint) => {
        if (typeof endpoint === 'string') {
          expect(endpoint).not.toMatch(/\/$/);
        }
      });
    });

    it('should start with forward slash', () => {
      const allSecureEndpoints = Object.values(SECURE_ENDPOINTS).flatMap(
        (group) => (typeof group === 'object' ? Object.values(group) : [group])
      );

      allSecureEndpoints.forEach((endpoint) => {
        if (typeof endpoint === 'string') {
          expect(endpoint).toMatch(/^\//);
        }
      });
    });
  });

  describe('Protected vs Secure Endpoints', () => {
    it('should have separate PROTECTED_ENDPOINTS config', () => {
      expect(PROTECTED_ENDPOINTS).toBeDefined();
      expect(typeof PROTECTED_ENDPOINTS).toBe('object');
    });

    it('should have separate SECURE_ENDPOINTS config', () => {
      expect(SECURE_ENDPOINTS).toBeDefined();
      expect(typeof SECURE_ENDPOINTS).toBe('object');
    });

    it('should not have overlapping endpoints between PROTECTED and SECURE', () => {
      const protectedEndpoints = JSON.stringify(PROTECTED_ENDPOINTS);
      const secureEndpoints = JSON.stringify(SECURE_ENDPOINTS);

      // They should be different structures
      expect(protectedEndpoints).not.toBe(secureEndpoints);
    });
  });

  describe('Address-related Endpoints', () => {
    it('should group address operations under user endpoints', () => {
      expect(SECURE_ENDPOINTS.USER.ADDRESSES).toBeDefined();
      expect(SECURE_ENDPOINTS.USER.CREATE_ADDRESS).toBeDefined();
    });

    it('should follow RESTful naming convention for addresses', () => {
      expect(SECURE_ENDPOINTS.USER.ADDRESSES).toBe('/user/addresses');
      expect(SECURE_ENDPOINTS.USER.CREATE_ADDRESS).toContain('addresses');
    });

    it('should use /create suffix for creation endpoint', () => {
      expect(SECURE_ENDPOINTS.USER.CREATE_ADDRESS).toMatch(/\/create$/);
    });
  });

  describe('Backward Compatibility', () => {
    it('should have EDIT_INFO under /user/ prefix', () => {
      expect(SECURE_ENDPOINTS.USER.EDIT_INFO).toBe('/user/edit-user-info');

      // Should NOT be the old standalone endpoint
      const oldEndpoint = '/edit-user-info';
      expect(SECURE_ENDPOINTS.USER.EDIT_INFO).not.toBe(oldEndpoint);
      expect(SECURE_ENDPOINTS.USER.EDIT_INFO).toContain('/user/');
    });

    it('should maintain consistent naming pattern', () => {
      // New pattern: /user/action-name
      expect(SECURE_ENDPOINTS.USER.EDIT_INFO).toMatch(/^\/user\/[a-z-]+$/);
      expect(SECURE_ENDPOINTS.USER.UPDATE_PROFILE).toMatch(/^\/user\/[a-z-]+$/);
    });
  });
});
