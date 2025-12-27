/**
 * Hook para manejar el registro de usuarios con el endpoint /api/mobile/protected/auth/signup
 * Soporta registro de USER, AUCTIONEER y HOST_AUCTIONEER
 */

import { useState, useCallback } from 'react';
import { useSecureApi } from '../api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import type { Lang, LangMap, UserRoles } from '@/types/types';
import * as Sentry from '@sentry/react-native';

export interface SignupData {
  // Campos comunes para todos los roles
  name: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Campos opcionales según el rol
  dni?: string;
  phoneNumber?: string;
  profilePicture?: string;

  // Campos adicionales para AUCTIONEER
  storeName?: string;
  webPage?: string;
  socialMedia?: string;
  address?: string;
  town?: string;
  province?: string;
  country?: string;
  postalCode?: string;
}

interface SignupResponse {
  error: LangMap | null;
  success: LangMap | null;
  data: {
    email: string;
  } | null;
}

interface UseSignupReturn {
  signup: (
    data: SignupData,
    role: UserRoles,
    lang: Lang
  ) => Promise<{
    success: boolean;
    email?: string;
    error?: LangMap;
  }>;
  isLoading: boolean;
  errorMessage: LangMap | null;
}

export const useSignup = (): UseSignupReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedPost } = useSecureApi();

  const signup = useCallback(
    async (
      data: SignupData,
      role: UserRoles,
      lang: Lang
    ): Promise<{
      success: boolean;
      email?: string;
      error?: LangMap;
    }> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await protectedPost<SignupResponse>({
          endpoint: PROTECTED_ENDPOINTS.AUTH.SIGNUP,
          data: {
            ...data,
            role,
            lang,
          },
        });

        if (response.error) {
          setErrorMessage(response.error);
          return {
            success: false,
            error: response.error,
          };
        }

        if (response.data?.data?.email) {
          return {
            success: true,
            email: response.data.data.email,
          };
        }

        // Caso inesperado: no hay error pero tampoco datos
        const fallbackError: LangMap = {
          es: 'Error inesperado durante el registro',
          en: 'Unexpected error during registration',
        };
        setErrorMessage(fallbackError);
        return {
          success: false,
          error: fallbackError,
        };
      } catch (error: any) {
        Sentry.captureException(
          `SIGNUP_ERROR: ${error?.message ?? 'Unknown error'}`
        );

        const networkError: LangMap = {
          es: 'Error de conexión. Por favor, verifica tu internet.',
          en: 'Connection error. Please check your internet.',
        };
        setErrorMessage(networkError);

        return {
          success: false,
          error: networkError,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [protectedPost]
  );

  return {
    signup,
    isLoading,
    errorMessage,
  };
};
