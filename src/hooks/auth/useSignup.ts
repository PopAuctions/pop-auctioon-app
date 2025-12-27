/**
 * Hook para manejar el registro de usuarios con el endpoint /api/mobile/protected/auth/signup
 * Soporta registro de USER, AUCTIONEER y HOST_AUCTIONEER
 *
 * Maneja automáticamente:
 * - Envío como JSON cuando no hay imagen
 * - Envío como FormData cuando hay imagen (más eficiente para archivos)
 * - Timeout extendido para uploads de imágenes
 */

import { useState, useCallback } from 'react';
import { useSecureApi } from '../api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import type {
  Lang,
  LangMap,
  UserRoles,
  SignupData,
  SignupResponse,
  UseSignupReturn,
} from '@/types/types';
import * as Sentry from '@sentry/react-native';

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
        // Detectar si hay imagen para decidir entre FormData o JSON
        const hasImage =
          data.profilePicture && data.profilePicture.trim() !== '';

        if (hasImage) {
          // CASO 1: Con imagen - usar FormData
          const formData = new FormData();

          // Metadatos de la request
          formData.append('role', role);
          formData.append('lang', lang);

          // Campos básicos (USER)
          formData.append('name', data.name);
          formData.append('lastName', data.lastName);
          formData.append('username', data.username);
          formData.append('email', data.email);
          formData.append('password', data.password);
          formData.append('confirmPassword', data.confirmPassword);
          formData.append('dni', data.dni || '');
          formData.append('phoneNumber', data.phoneNumber || '');

          // Campos adicionales (AUCTIONEER)
          if ('storeName' in data) {
            formData.append('storeName', data.storeName || '');
            formData.append('webPage', data.webPage || '');
            formData.append('socialMedia', data.socialMedia || '');
            formData.append('address', data.address || '');
            formData.append('town', data.town || '');
            formData.append('province', data.province || '');
            formData.append('country', data.country || '');
            formData.append('postalCode', data.postalCode || '');
          }

          // Agregar archivo de imagen
          if (data.profilePicture) {
            const uriParts = data.profilePicture.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('profilePicture', {
              uri: data.profilePicture,
              name: `profile.${fileType}`,
              type: `image/${fileType}`,
            } as any);
          }

          const response = await protectedPost<SignupResponse>({
            endpoint: PROTECTED_ENDPOINTS.AUTH.SIGNUP,
            data: formData,
            options: {
              timeout: 30000, // 30 segundos para uploads
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
        } else {
          // CASO 2: Sin imagen - usar JSON (más eficiente)
          const response = await protectedPost<SignupResponse>({
            endpoint: PROTECTED_ENDPOINTS.AUTH.SIGNUP,
            data: {
              role,
              lang,
              userData: data,
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
        }
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
