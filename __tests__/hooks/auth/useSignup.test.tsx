import { renderHook, waitFor } from '@testing-library/react-native';
import { useSignup } from '@/hooks/auth/useSignup';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import * as Sentry from '@sentry/react-native';
import { File } from 'expo-file-system';

// Mock dependencies
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@sentry/react-native');
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
}));

describe('useSignup', () => {
  const mockProtectedPost = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSecureApi as jest.Mock).mockReturnValue({
      protectedPost: mockProtectedPost,
    });
  });

  describe('signup - success cases', () => {
    it('should register user successfully without profile picture', async () => {
      mockProtectedPost.mockResolvedValue({
        status: 201,
        data: {
          error: null,
          success: { en: 'User created', es: 'Usuario creado' },
          data: { email: 'test@example.com' },
        },
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(true);
      expect(response.email).toBe('test@example.com');
      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: '/auth/signup',
        data: {
          role: 'USER',
          lang: 'en',
          ...signupData,
        },
        options: { timeout: 30000 },
      });
    });

    it('should register user successfully with profile picture', async () => {
      const mockBase64 = 'base64imagedata';
      const mockFile = {
        base64: jest.fn().mockResolvedValue(mockBase64),
      };
      (File as jest.Mock).mockImplementation(() => mockFile);

      mockProtectedPost.mockResolvedValue({
        status: 201,
        data: {
          error: null,
          success: { en: 'User created', es: 'Usuario creado' },
          data: { email: 'test@example.com' },
        },
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: 'file:///path/to/image.jpg',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(true);
      expect(response.email).toBe('test@example.com');
      expect(mockFile.base64).toHaveBeenCalled();
    });

    it('should handle direct email in response data', async () => {
      mockProtectedPost.mockResolvedValue({
        status: 201,
        data: { email: 'test@example.com' },
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(true);
      expect(response.email).toBe('test@example.com');
    });
  });

  describe('signup - error cases', () => {
    it('should handle API error', async () => {
      const errorMessage = { en: 'Network error', es: 'Error de red' };
      mockProtectedPost.mockResolvedValue({
        error: errorMessage,
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(false);
      expect(response.error).toEqual(errorMessage);
    });

    it('should handle backend validation error (400)', async () => {
      const errorMessage = { en: 'Invalid Fields', es: 'Campos inválidos' };
      mockProtectedPost.mockResolvedValue({
        status: 400,
        error: errorMessage,
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(false);
      expect(response.error).toEqual(errorMessage);
    });

    it('should handle image conversion error', async () => {
      const mockFile = {
        base64: jest.fn().mockRejectedValue(new Error('File read error')),
      };
      (File as jest.Mock).mockImplementation(() => mockFile);

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: 'file:///path/to/image.jpg',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(false);
      expect(response.error).toEqual({
        es: 'Error al procesar la imagen de perfil',
        en: 'Error processing profile picture',
      });
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should handle network timeout', async () => {
      mockProtectedPost.mockRejectedValue(new Error('Network timeout'));

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(false);
      expect(response.error).toEqual({
        es: 'Error de conexión. Por favor, verifica tu internet.',
        en: 'Connection error. Please check your internet.',
      });
      expect(Sentry.captureException).toHaveBeenCalledWith(
        'SIGNUP_ERROR: Network timeout'
      );
    });

    it('should handle unexpected response format', async () => {
      mockProtectedPost.mockResolvedValue({
        status: 201,
        data: { unexpected: 'format' },
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const response = await result.current.signup(signupData, 'USER', 'en');

      expect(response.success).toBe(false);
      expect(response.error).toEqual({
        es: 'Error inesperado durante el registro',
        en: 'Unexpected error during registration',
      });
    });
  });

  describe('signup - loading state', () => {
    it('should set isLoading to true during signup', async () => {
      mockProtectedPost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 201,
                  data: {
                    data: { email: 'test@example.com' },
                  },
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useSignup());

      expect(result.current.isLoading).toBe(false);

      const signupData = {
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '',
        phoneNumber: '',
        profilePicture: '',
      };

      const signupPromise = result.current.signup(signupData, 'USER', 'en');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await signupPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('signup - AUCTIONEER role', () => {
    it('should register auctioneer with extended fields', async () => {
      mockProtectedPost.mockResolvedValue({
        status: 201,
        data: {
          data: { email: 'auctioneer@example.com' },
        },
      });

      const { result } = renderHook(() => useSignup());

      const auctioneerData = {
        name: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'auctioneer@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        dni: '12345678',
        phoneNumber: '+123456789',
        profilePicture: '',
        storeName: 'Jane Auction House',
        webPage: 'https://janeauction.com',
        socialMedia: '@janeauction',
        address: '123 Main St',
        town: 'Springfield',
        province: 'IL',
        country: 'USA',
        postalCode: '62701',
      };

      const response = await result.current.signup(
        auctioneerData,
        'AUCTIONEER',
        'en'
      );

      expect(response.success).toBe(true);
      expect(response.email).toBe('auctioneer@example.com');
      expect(mockProtectedPost).toHaveBeenCalledWith({
        endpoint: '/auth/signup',
        data: {
          role: 'AUCTIONEER',
          lang: 'en',
          ...auctioneerData,
        },
        options: { timeout: 30000 },
      });
    });
  });
});
