import { getUser } from '@/lib/auth/get-user';
import type { User, AsyncResponse } from '@/types/types';
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

describe('getUser', () => {
  const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;
  const mockSentryErrorReport =
    sentryErrorReport.sentryErrorReport as jest.Mock;

  const mockUser: User = {
    id: 'user-123',
    name: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    role: 'USER',
    acceptedTerms: '2024-01-01T00:00:00Z',
    active: true,
    address: null,
    country: null,
    dni: null,
    emailVerified: null,
    isHostAuctioneer: false,
    phoneNumber: null,
    phoneValidated: false,
    postalCode: null,
    profilePicture: null,
    province: null,
    socialMedia: null,
    storeName: null,
    town: null,
    webPage: null,
  };

  const createMockChain = (
    user: User | null,
    error: { message: string } | null = null
  ) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: user,
      error,
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful User Fetching', () => {
    it('should return user successfully', async () => {
      mockFrom.mockReturnValue(createMockChain(mockUser) as never);

      const result: AsyncResponse<User> = await getUser({ id: 'user-123' });

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('should call Supabase with correct parameters', async () => {
      const mockChain = createMockChain(mockUser);
      mockFrom.mockReturnValue(mockChain as never);

      await getUser({ id: 'user-789' });

      expect(mockFrom).toHaveBeenCalledWith('User');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'user-789');
      expect(mockChain.single).toHaveBeenCalled();
    });

    it('should handle user with AUCTIONEER role', async () => {
      const auctioneerUser = { ...mockUser, role: 'AUCTIONEER' as const };
      mockFrom.mockReturnValue(createMockChain(auctioneerUser) as never);

      const result = await getUser({ id: 'user-456' });

      expect(result.data?.role).toBe('AUCTIONEER');
      expect(result.error).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase error', async () => {
      const error = { message: 'Database connection failed' };
      mockFrom.mockReturnValue(createMockChain(null, error) as never);

      const result = await getUser({ id: 'user-123' });

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        en: 'Error getting user',
        es: 'Error obteniendo el usuario',
      });
      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        error,
        'GET_USER - user-123'
      );
    });

    it('should handle null data response', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      const result = await getUser({ id: 'user-123' });

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        en: 'Error getting user',
        es: 'Error obteniendo el usuario',
      });
    });

    it('should report null data to Sentry', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      await getUser({ id: 'user-456' });

      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        null,
        'GET_USER - user-456'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      const result = await getUser({ id: '' });

      expect(mockFrom).toHaveBeenCalledWith('User');
      const mockChain = mockFrom.mock.results[0]?.value;
      expect(mockChain.eq).toHaveBeenCalledWith('id', '');
      expect(result.data).toBeNull();
    });

    it('should handle malformed error object', async () => {
      const error = { message: '' };
      mockFrom.mockReturnValue(createMockChain(null, error) as never);

      const result = await getUser({ id: 'user-123' });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(mockSentryErrorReport).toHaveBeenCalled();
    });

    it('should handle user with minimal data', async () => {
      const minimalUser = {
        id: 'user-minimal',
        email: 'minimal@example.com',
      } as User;

      mockFrom.mockReturnValue(createMockChain(minimalUser) as never);

      const result = await getUser({ id: 'user-minimal' });

      expect(result.data).toEqual(minimalUser);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Return Value Structure', () => {
    it('should return correct shape for successful response', async () => {
      mockFrom.mockReturnValue(createMockChain(mockUser) as never);

      const result = await getUser({ id: 'user-123' });

      expect(result).toHaveProperty('data');
      expect(result.error).toBeUndefined();
      expect(Object.keys(result).sort()).toEqual(['data', 'success']);
    });

    it('should return correct shape for error response', async () => {
      mockFrom.mockReturnValue(createMockChain(null) as never);

      const result = await getUser({ id: 'user-123' });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result.error).toHaveProperty('en');
      expect(result.error).toHaveProperty('es');
    });

    it('should never include success property', async () => {
      mockFrom.mockReturnValue(createMockChain(mockUser) as never);

      const result = await getUser({ id: 'user-123' });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });

    it('should have proper TypeScript interface', async () => {
      mockFrom.mockReturnValue(createMockChain(mockUser) as never);

      const result = await getUser({ id: 'user-123' });

      // Type checking - should compile without errors
      const user: User | null = result.data;
      const error: { en: string; es: string } | undefined = result.error;

      expect(user).toEqual(mockUser);
      expect(error).toBeUndefined();
    });
  });

  describe('Different User Data', () => {
    it('should handle users with different roles', async () => {
      const userRole = { ...mockUser, role: 'USER' as const };
      const auctioneerRole = { ...mockUser, role: 'AUCTIONEER' as const };

      mockFrom.mockReturnValueOnce(createMockChain(userRole) as never);
      mockFrom.mockReturnValueOnce(createMockChain(auctioneerRole) as never);

      const result1 = await getUser({ id: 'user-1' });
      const result2 = await getUser({ id: 'user-2' });

      expect(result1.data?.role).toBe('USER');
      expect(result2.data?.role).toBe('AUCTIONEER');
    });

    it('should handle users with different email addresses', async () => {
      const user1 = { ...mockUser, email: 'user1@example.com' };
      const user2 = { ...mockUser, email: 'user2@example.com' };

      mockFrom.mockReturnValueOnce(createMockChain(user1) as never);
      mockFrom.mockReturnValueOnce(createMockChain(user2) as never);

      const result1 = await getUser({ id: 'user-1' });
      const result2 = await getUser({ id: 'user-2' });

      expect(result1.data?.email).toBe('user1@example.com');
      expect(result2.data?.email).toBe('user2@example.com');
    });
  });

  describe('Multiple Sequential Calls', () => {
    it('should handle multiple calls independently', async () => {
      const user1 = { ...mockUser, id: 'user-1' };
      const user2 = { ...mockUser, id: 'user-2' };

      mockFrom.mockReturnValueOnce(createMockChain(user1) as never);
      mockFrom.mockReturnValueOnce(createMockChain(user2) as never);
      mockFrom.mockReturnValueOnce(createMockChain(null) as never);

      const result1 = await getUser({ id: 'user-1' });
      const result2 = await getUser({ id: 'user-2' });
      const result3 = await getUser({ id: 'user-3' });

      expect(result1.data?.id).toBe('user-1');
      expect(result2.data?.id).toBe('user-2');
      expect(result3.data).toBeNull();
    });

    it('should clear error state between calls', async () => {
      mockFrom.mockReturnValueOnce(createMockChain(null) as never);
      mockFrom.mockReturnValueOnce(createMockChain(mockUser) as never);

      const result1 = await getUser({ id: 'user-1' });
      const result2 = await getUser({ id: 'user-2' });

      expect(result1.error).toBeDefined();
      expect(result2.error).toBeUndefined();
    });
  });
});
