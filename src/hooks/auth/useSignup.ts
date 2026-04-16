/**
 * Hook para manejar el registro de usuarios con el endpoint /api/mobile/protected/auth/signup
 * Soporta registro de USER, AUCTIONEER y HOST_AUCTIONEER
 *
 * NOTA: Este endpoint es PROTECTED (no SECURE), por lo que SIEMPRE usa JSON.
 * Si hay imagen, se convierte a base64 y se envía como objeto UploadFile en el JSON.
 */

import { useState, useCallback } from 'react';
import { useSecureApi } from '../api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import type {
  Lang,
  LangMap,
  UserRoles,
  SignupResponse,
  UseSignupReturn,
  UploadFile,
  SignupData,
} from '@/types/types';
import * as Sentry from '@sentry/react-native';
import { File } from 'expo-file-system';

/**
 * Convierte una URI de imagen local a un objeto UploadFile con base64
 */
const convertImageToUploadFile = async (
  uri: string
): Promise<UploadFile | null> => {
  try {
    const file = new File(uri);
    const base64 = await file.base64();

    const uriParts = uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
    const fileName = `profile.${fileExtension}`;
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

    return {
      src: uri,
      name: fileName,
      type: mimeType,
      arrayBuffer: base64,
    };
  } catch (error) {
    console.error('ERROR_CONVERT_IMAGE', error);
    Sentry.captureException(error);
    return null;
  }
};

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
        // Convertir imagen a UploadFile si existe
        let uploadFileData: SignupData = { ...data };

        if (data.profilePicture && data.profilePicture.trim() !== '') {
          const uploadFile = await convertImageToUploadFile(
            data.profilePicture
          );

          if (!uploadFile) {
            const imageError: LangMap = {
              es: 'Error al procesar la imagen de perfil',
              en: 'Error processing profile picture',
            };
            setErrorMessage(imageError);
            return {
              success: false,
              error: imageError,
            };
          }

          // Reemplazar la URI con el objeto UploadFile
          uploadFileData = {
            ...data,
            profilePicture: uploadFile as any, // TypeScript espera string, pero enviamos UploadFile
          };
        }

        // SIEMPRE usar JSON (el endpoint PROTECTED no soporta FormData)
        // Aplanar los campos con spread operator - backend espera campos en nivel raíz
        const response = await protectedPost<any>({
          endpoint: PROTECTED_ENDPOINTS.AUTH.SIGNUP,
          data: {
            role,
            lang,
            ...uploadFileData, // Spread para aplanar campos
          },
          options: {
            timeout: 30000, // Timeout extendido por si hay imagen
          },
        });

        // Si hay error del API (network, timeout, etc.) - useSecureApi lo detecta
        if (response.error) {
          setErrorMessage(response.error);
          return {
            success: false,
            error: response.error,
          };
        }

        // Status 201 = éxito
        // Backend devuelve toda la respuesta en response.data:
        // { error: null, success: { en: "...", es: "..." }, data: { email: "..." } }
        if (response.status === 201 && response.data) {
          const fullResponse = response.data as SignupResponse;

          // Verificar si hay email en la estructura anidada
          if (fullResponse.data?.email) {
            return {
              success: true,
              email: fullResponse.data.email,
            };
          }

          // O directamente en response.data si useSecureApi lo extrajo
          if ((response.data as any).email) {
            return {
              success: true,
              email: (response.data as any).email,
            };
          }
        }

        // Status 400+ = error del backend
        if (response.status && response.status >= 400) {
          const errorMsg = response.error || {
            es: 'Error en el registro',
            en: 'Registration error',
          };
          setErrorMessage(errorMsg);
          return {
            success: false,
            error: errorMsg,
          };
        }

        // Caso inesperado
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
