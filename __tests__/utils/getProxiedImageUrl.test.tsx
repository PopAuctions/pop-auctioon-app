/**
 * Test suite for getProxiedImageUrl utility
 * Tests image URL transformation for proxy routing
 */

import { getProxiedImageUrl } from '@/utils/getProxiedImageUrl';

describe('getProxiedImageUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_BASE_URL;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_BASE_URL = 'https://example.com';
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_BASE_URL = originalEnv;
  });

  describe('Basic URL transformation', () => {
    it('should transform Supabase storage URL to proxied URL', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/test-image.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/test-image.jpg');
    });

    it('should extract filename correctly from path', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/products/item-123.png';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/products/item-123.png');
    });

    it('should handle nested folder structures', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/users/avatars/profile-pic.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe(
        'https://example.com/images/users/avatars/profile-pic.jpg'
      );
    });
  });

  describe('plainUrl parameter', () => {
    it('should return original URL when plainUrl is true', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/test.jpg';
      const result = getProxiedImageUrl(imageUrl, true);

      expect(result).toBe(imageUrl);
    });

    it('should return proxied URL when plainUrl is false', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/test.jpg';
      const result = getProxiedImageUrl(imageUrl, false);

      expect(result).toBe('https://example.com/images/test.jpg');
    });

    it('should return proxied URL when plainUrl is undefined (default)', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/test.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/test.jpg');
    });
  });

  describe('Edge cases and fallbacks', () => {
    it('should return original URL if base path is not found', () => {
      const imageUrl = 'https://external-cdn.com/images/photo.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe(imageUrl);
    });

    it('should return original URL for non-Supabase storage URLs', () => {
      const imageUrl = 'https://example.com/other-storage/image.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe(imageUrl);
    });

    it('should handle empty string', () => {
      const result = getProxiedImageUrl('');

      expect(result).toBe('');
    });

    it('should handle URL with query parameters', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/image.jpg?t=123';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/image.jpg?t=123');
    });

    it('should return original URL with plainUrl=true even if malformed', () => {
      const imageUrl = 'not-a-valid-url';
      const result = getProxiedImageUrl(imageUrl, true);

      expect(result).toBe(imageUrl);
    });
  });

  describe('Different file extensions', () => {
    it('should handle JPG files', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/photo.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/photo.jpg');
    });

    it('should handle PNG files', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/logo.png';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/logo.png');
    });

    it('should handle WEBP files', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/banner.webp';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/banner.webp');
    });

    it('should handle files without extension', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/image-no-ext';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/image-no-ext');
    });
  });

  describe('Special characters in filenames', () => {
    it('should handle filenames with spaces (encoded)', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/my%20image.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/my%20image.jpg');
    });

    it('should handle filenames with dashes', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/my-test-image.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/my-test-image.jpg');
    });

    it('should handle filenames with underscores', () => {
      const imageUrl =
        'https://supabase.com/storage/v1/object/public/develop/images/my_test_image.jpg';
      const result = getProxiedImageUrl(imageUrl);

      expect(result).toBe('https://example.com/images/my_test_image.jpg');
    });
  });
});
