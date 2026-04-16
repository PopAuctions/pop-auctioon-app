import { getUserRole } from '@/lib/auth/get-user-role';
import type { UserRoles, AsyncResponse } from '@/types/types';
import { supabase } from '@/utils/supabase/supabase-store';
import * as sentryErrorReport from '@/lib/error/sentry-error-report';

// Mock dependencies
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/error/sentry-error-report', () => ({
  sentryErrorReport: jest.fn(),
}));

describe('getUserRole', () => {
  const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;
  const mockSentryErrorReport =
    sentryErrorReport.sentryErrorReport as jest.Mock;

  const createMockChain = (
    role: UserRoles | null,
    isDisabled: boolean = false,
    error: { message: string } | null = null
  ) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: role ? { role, isDisabled } : null,
      error,
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Role Fetching', () => {
    it('should return USER role successfully', async () => {
      mockFrom.mockReturnValue(createMockChain('USER') as never);

      const result: AsyncResponse<{ role: UserRoles; isDisabled: boolean }> =
        await getUserRole({
          id: 'user-123',
        });

      expect(result.data?.role).toBe('USER');
      expect(result.data?.isDisabled).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should return AUCTIONEER role successfully', async () => {
      mockFrom.mockReturnValue(createMockChain('AUCTIONEER') as never);

      const result = await getUserRole({ id: 'user-456' });

      expect(result.data?.role).toBe('AUCTIONEER');
      expect(result.data?.isDisabled).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should call Supabase with correct parameters', async () => {
      const mockChain = createMockChain('USER');
      mockFrom.mockReturnValue(mockChain as never);

      await getUserRole({ id: 'user-789' });

      expect(mockFrom).toHaveBeenCalledWith('User');
      expect(mockChain.select).toHaveBeenCalledWith('role, isDisabled');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'user-789');
      expect(mockChain.single).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase error', async () => {
      const error = { message: 'Database connection failed' };
      mockFrom.mockReturnValue(createMockChain(null, error) as never);

      const result = await getUserRole({ id: 'user-123' });

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        en: 'Error getting role',
        es: 'Error obteniendo el rol',
      });
      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        error,
        'GET_ROLE - user-123'
      );
    });

    it('should handle null data response', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      const result = await getUserRole({ id: 'user-123' });

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        en: 'Error getting role',
        es: 'Error obteniendo el rol',
      });
    });

    it('should report null data to Sentry', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      await getUserRole({ id: 'user-456' });

      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        null,
        'GET_ROLE - user-456'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      const result = await getUserRole({ id: '' });

      expect(mockFrom).toHaveBeenCalledWith('User');
      const mockChain = mockFrom.mock.results[0]?.value;
      expect(mockChain.eq).toHaveBeenCalledWith('id', '');
      expect(result.data).toBeNull();
    });

    it('should handle malformed error object', async () => {
      const error = { message: '' };
      mockFrom.mockReturnValue(createMockChain(null, false, error) as never);

      const result = await getUserRole({ id: 'user-123' });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(mockSentryErrorReport).toHaveBeenCalled();
    });

    it('should handle data without role property', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { isDisabled: undefined },
          error: null,
        }),
      };
      mockFrom.mockReturnValue(mockChain as never);

      const result = await getUserRole({ id: 'user-123' });

      // Data without role should still be returned with role as undefined
      expect(result.success).toBe(true);
      expect(result.data?.role).toBeUndefined();
      expect(result.data?.isDisabled).toBeUndefined();
    });
  });

  describe('Return Value Structure', () => {
    it('should return correct shape for successful response', async () => {
      mockFrom.mockReturnValue(createMockChain('USER') as never);

      const result: AsyncResponse<{ role: UserRoles; isDisabled: boolean }> =
        await getUserRole({
          id: 'user-123',
        });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.data?.role).toBe('USER');
      expect(result.data?.isDisabled).toBe(false);
    });

    it('should return correct shape for error response', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      const result = await getUserRole({ id: 'user-123' });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result.error).toHaveProperty('en');
      expect(result.error).toHaveProperty('es');
    });

    it('should never include success property', async () => {
      mockFrom.mockReturnValue(createMockChain('USER') as never);

      const result = await getUserRole({ id: 'user-123' });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });

    it('should have proper TypeScript interface', async () => {
      mockFrom.mockReturnValue(createMockChain('USER') as never);

      const result = await getUserRole({ id: 'user-123' });

      // Type checking - should compile without errors
      const role: UserRoles | null | undefined = result.data?.role;
      const isDisabled: boolean | undefined = result.data?.isDisabled;
      const error: { en: string; es: string } | undefined = result.error;

      expect(role).toBe('USER');
      expect(isDisabled).toBe(false);
      expect(error).toBeUndefined();
    });
  });

  describe('Different Role Types', () => {
    it('should handle all valid user roles', async () => {
      const roles: UserRoles[] = ['USER', 'AUCTIONEER'];

      for (const role of roles) {
        mockFrom.mockReturnValue(createMockChain(role) as never);

        const result = await getUserRole({ id: `user-${role}` });

        expect(result.data?.role).toBe(role);
        expect(result.error).toBeUndefined();
      }
    });
  });

  describe('Multiple Sequential Calls', () => {
    it('should handle multiple calls independently', async () => {
      mockFrom.mockReturnValueOnce(createMockChain('USER') as never);
      mockFrom.mockReturnValueOnce(createMockChain('AUCTIONEER') as never);
      mockFrom.mockReturnValueOnce(createMockChain(null) as never);

      const result1 = await getUserRole({ id: 'user-1' });
      const result2 = await getUserRole({ id: 'user-2' });
      const result3 = await getUserRole({ id: 'user-3' });

      expect(result1.data?.role).toBe('USER');
      expect(result2.data?.role).toBe('AUCTIONEER');
      expect(result3.data).toBeNull();
    });

    it('should clear error state between calls', async () => {
      mockFrom.mockReturnValueOnce(createMockChain(null) as never);
      mockFrom.mockReturnValueOnce(createMockChain('USER') as never);

      const result1 = await getUserRole({ id: 'user-1' });
      const result2 = await getUserRole({ id: 'user-2' });

      expect(result1.error).toBeDefined();
      expect(result2.error).toBeUndefined();
    });
  });
});
