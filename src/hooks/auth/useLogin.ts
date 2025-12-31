/**
 * Hook para manejar el login con Supabase
 * Encapsula la lógica de autenticación y retorna códigos de error consistentes
 */

import { useState } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import type { LangMap } from '@/types/types';

type LoginError =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'USER_NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | null;

interface UseLoginReturn {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error: LoginError }>;
  isLoading: boolean;
  errorMessage: LangMap | null;
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);

  const getErrorCode = (error: {
    message: string;
    status?: number;
  }): LoginError => {
    // Mapear errores de Supabase a códigos consistentes
    if (error.status === 400) {
      // 400: Credenciales inválidas, email no confirmado, etc.
      if (
        error.message.toLowerCase().includes('email') &&
        error.message.toLowerCase().includes('confirm')
      ) {
        return 'EMAIL_NOT_CONFIRMED';
      }
      // Por defecto, 400 = credenciales inválidas
      return 'INVALID_CREDENTIALS';
    }

    if (error.status === 404) {
      return 'USER_NOT_FOUND';
    }

    if (error.status === 429) {
      return 'TOO_MANY_REQUESTS';
    }

    // Error de red o desconocido
    return 'NETWORK_ERROR';
  };

  const getErrorMessage = (errorCode: LoginError): LangMap => {
    const errorMessages: Record<Exclude<LoginError, null>, LangMap> = {
      INVALID_CREDENTIALS: {
        es: 'Credenciales de acceso inválidas',
        en: 'Invalid login credentials',
      },
      EMAIL_NOT_CONFIRMED: {
        es: 'Email no confirmado',
        en: 'Email not confirmed',
      },
      USER_NOT_FOUND: {
        es: 'Usuario no encontrado',
        en: 'User not found',
      },
      TOO_MANY_REQUESTS: {
        es: 'Demasiados intentos de inicio de sesión. Por favor, intenta más tarde.',
        en: 'Too many login attempts. Please try again later.',
      },
      NETWORK_ERROR: {
        es: 'Error de conexión. Por favor, verifica tu internet.',
        en: 'Connection error. Please check your internet.',
      },
    };

    return errorCode ? errorMessages[errorCode] : { es: '', en: '' };
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error: LoginError }> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorCode = getErrorCode(error);
        setErrorMessage(getErrorMessage(errorCode));
        setIsLoading(false);
        return { success: false, error: errorCode };
      }

      setIsLoading(false);
      return { success: true, error: null };
    } catch (error) {
      const errorCode: LoginError = 'NETWORK_ERROR';
      setErrorMessage(getErrorMessage(errorCode));
      setIsLoading(false);
      return { success: false, error: errorCode };
    }
  };

  return {
    login,
    isLoading,
    errorMessage,
  };
};
