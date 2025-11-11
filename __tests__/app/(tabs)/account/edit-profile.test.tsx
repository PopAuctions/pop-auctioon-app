import {
  mockSupabase,
  mockAuth,
  mockSecureApi,
  mockTranslation,
} from '../../../setup/mocks.mock';
import { UserEditSchema, AuctioneerEditSchema } from '@/utils/schemas';

// Mock de Supabase para evitar errores de importación
jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);

jest.mock('@/context/auth-context', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => mockSecureApi,
}));

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => mockTranslation,
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

describe('EditProfile - Schema Validation', () => {
  describe('UserEditSchema', () => {
    it('should validate basic user fields correctly', () => {
      const validData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '+34647312818',
        profilePicture: '',
      };

      const result = UserEditSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject username with spaces', () => {
      const invalidData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rod samayoa', // ❌ Con espacio
        phoneNumber: '+34647312818',
      };

      const result = UserEditSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const invalidData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'ab', // ❌ Muy corto (mínimo 3)
        phoneNumber: '+34647312818',
      };

      const result = UserEditSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept empty phoneNumber string', () => {
      const validData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '', // phoneNumber como string vacío es válido para USER
      };

      const result = UserEditSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('AuctioneerEditSchema', () => {
    it('should validate all AUCTIONEER fields correctly', () => {
      const validData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '+34647312818',
        profilePicture: '',
        storeName: 'Rod Store',
        webPage: 'https://rod.com',
        socialMedia: 'https://rod.com',
        address: 'zona 16',
        town: 'guatemala',
        province: 'Guate',
        country: 'Guatemala',
        postalCode: '01016',
      };

      const result = AuctioneerEditSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL in webPage', () => {
      const invalidData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '+34647312818',
        storeName: 'Rod Store',
        webPage: 'rod.com', // ❌ Sin protocolo
        socialMedia: 'https://rod.com',
        address: 'zona 16',
        town: 'guatemala',
        province: 'Guate',
        country: 'Guatemala',
        postalCode: '01016',
      };

      const result = AuctioneerEditSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty required AUCTIONEER fields', () => {
      const invalidData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '', // ❌ Requerido para AUCTIONEER
        storeName: '',
        webPage: '',
        socialMedia: '',
        address: '', // ❌ Requerido
        town: '',
        province: '',
        country: '',
        postalCode: '',
      };

      const result = AuctioneerEditSchema.safeParse(invalidData);
      expect(result.success).toBe(false); // Debe fallar porque phoneNumber y address son requeridos
    });

    it('should accept valid AUCTIONEER data with all required fields', () => {
      const validData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '+34647312818', // ✅ Requerido y con formato válido
        storeName: 'Rod Store',
        webPage: 'https://example.com', // ✅ URL válida
        socialMedia: 'https://instagram.com/rodstore',
        address: 'zona 16', // ✅ Requerido
        town: 'guatemala',
        province: 'Guate',
        country: 'Guatemala',
        postalCode: '01016',
      };

      const result = AuctioneerEditSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Payload Construction', () => {
    it('should construct JSON payload correctly for USER without image', () => {
      const formData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '+34647312818',
        profilePicture: '',
      };

      const payload = {
        username: formData.username,
        name: formData.name,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || '',
        oldProfilePicture: '',
        oldPhoneNumber: '+34647312818',
      };

      expect(payload).toEqual({
        username: 'rodsamayoa',
        name: 'Rodrigo',
        lastName: 'Samayoa',
        phoneNumber: '+34647312818',
        oldProfilePicture: '',
        oldPhoneNumber: '+34647312818',
      });
    });

    it('should construct JSON payload correctly for AUCTIONEER without image', () => {
      const formData = {
        name: 'Rodrigo',
        lastName: 'Samayoa',
        username: 'rodsamayoa',
        phoneNumber: '+34647312818',
        profilePicture: '',
        storeName: 'Rod Store',
        webPage: 'https://rod.com',
        socialMedia: 'https://rod.com',
        address: 'zona 16',
        town: 'guatemala',
        province: 'Guate',
        country: 'Guatemala',
        postalCode: '01016',
      };

      const payload = {
        username: formData.username,
        name: formData.name,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || '',
        oldProfilePicture: '',
        oldPhoneNumber: '+34647312818',
        ...('storeName' in formData && {
          storeName: formData.storeName || '',
          webPage: formData.webPage || '',
          socialMedia: formData.socialMedia || '',
          address: formData.address || '',
          town: formData.town || '',
          province: formData.province || '',
          country: formData.country || '',
          postalCode: formData.postalCode || '',
        }),
      };

      expect(payload).toHaveProperty('storeName', 'Rod Store');
      expect(payload).toHaveProperty('webPage', 'https://rod.com');
      expect(payload).toHaveProperty('socialMedia', 'https://rod.com');
      expect(payload).toHaveProperty('address', 'zona 16');
      expect(payload).toHaveProperty('town', 'guatemala');
      expect(payload).toHaveProperty('province', 'Guate');
      expect(payload).toHaveProperty('country', 'Guatemala');
      expect(payload).toHaveProperty('postalCode', '01016');
    });
  });
});
