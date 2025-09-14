import { useCallback } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import {
  API_CONFIG,
  HEADERS_CONFIG,
  SECURITY_LEVELS,
  API_ERROR_CODES,
  DEV_CONFIG,
} from '@/config/api-config';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestOptions {
  timeout?: number;
  retries?: number;
}

export const useSecureApi = () => {
  // Función auxiliar para crear headers básicos
  const createBaseHeaders = useCallback(() => {
    return {
      [HEADERS_CONFIG.CONTENT_TYPE_HEADER]: HEADERS_CONFIG.CONTENT_TYPE_VALUE,
      [HEADERS_CONFIG.API_KEY_HEADER]: API_CONFIG.API_KEY,
      [HEADERS_CONFIG.TIMESTAMP_HEADER]: Date.now().toString(),
    };
  }, []);

  // Función auxiliar para crear headers con JWT
  const createSecureHeaders = useCallback(async () => {
    const baseHeaders = createBaseHeaders();

    // Obtener sesión actual de Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error(API_ERROR_CODES.MISSING_JWT);
    }

    return {
      ...baseHeaders,
      [HEADERS_CONFIG.AUTHORIZATION_HEADER]: `Bearer ${session.access_token}`,
    };
  }, [createBaseHeaders]);

  // Función auxiliar para hacer requests HTTP
  const makeRequest = useCallback(
    async <T>(
      url: string,
      options: RequestInit,
      requestOptions: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      const { timeout = API_CONFIG.TIMEOUT, retries = API_CONFIG.MAX_RETRIES } =
        requestOptions;

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          // Logging para desarrollo
          if (DEV_CONFIG.ENABLE_REQUEST_LOGGING) {
            console.log(
              `🚀 API Request: ${options.method} ${API_CONFIG.BASE_URL}${url}`
            );
          }

          const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Intentar parsear como JSON, si falla usar texto plano
          let responseData: any;
          try {
            responseData = await response.json();
          } catch {
            // Si no es JSON válido, obtener como texto
            const textResponse = await response.text();
            responseData = {
              error: `Non-JSON Response (${response.status})`,
              responseText: textResponse.substring(0, 200) + (textResponse.length > 200 ? '...' : ''),
              contentType: response.headers.get('content-type') || 'unknown'
            };
          }

          // Logging para desarrollo
          if (DEV_CONFIG.ENABLE_RESPONSE_LOGGING) {
            console.log(`✅ API Response: ${response.status}`, responseData);
          }

          return {
            data: responseData,
            status: response.status,
            error: response.ok
              ? undefined
              : responseData.error || 'Error en la petición',
          };
        } catch (error) {
          lastError = error as Error;

          // Logging de errores
          if (DEV_CONFIG.ENABLE_REQUEST_LOGGING) {
            console.error(`❌ API Error (attempt ${attempt + 1}):`, error);
          }

          // Si es el último intento, lanzar el error
          if (attempt === retries) {
            break;
          }

          // Esperar antes del siguiente intento (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * API_CONFIG.RETRY_DELAY)
          );
        }
      }

      return {
        status: 0,
        error: lastError?.message || API_ERROR_CODES.NETWORK_ERROR,
      };
    },
    []
  );

  // ========================================
  // MÉTODOS PROTEGIDOS (Solo API Key)
  // ========================================

  const protectedGet = useCallback(
    async <T>(
      endpoint: string,
      options: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      const headers = createBaseHeaders();

      return makeRequest<T>(
        `/api/mobile/${SECURITY_LEVELS.PROTECTED}${endpoint}`,
        {
          method: 'GET',
          headers,
        },
        options
      );
    },
    [createBaseHeaders, makeRequest]
  );

  const protectedPost = useCallback(
    async <T>(
      endpoint: string,
      data: any,
      options: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      const headers = createBaseHeaders();

      return makeRequest<T>(
        `/api/mobile/${SECURITY_LEVELS.PROTECTED}${endpoint}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        },
        options
      );
    },
    [createBaseHeaders, makeRequest]
  );

  // ========================================
  // MÉTODOS SEGUROS (JWT + API Key)
  // ========================================

  const secureGet = useCallback(
    async <T>(
      endpoint: string,
      options: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      try {
        const headers = await createSecureHeaders();

        return makeRequest<T>(
          `/api/mobile/${SECURITY_LEVELS.SECURE}${endpoint}`,
          {
            method: 'GET',
            headers,
          },
          options
        );
      } catch (error) {
        return {
          status: 401,
          error: (error as Error).message,
        };
      }
    },
    [createSecureHeaders, makeRequest]
  );

  const securePost = useCallback(
    async <T>(
      endpoint: string,
      data: any,
      options: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      try {
        const headers = await createSecureHeaders();

        return makeRequest<T>(
          `/api/mobile/${SECURITY_LEVELS.SECURE}${endpoint}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
          },
          options
        );
      } catch (error) {
        return {
          status: 401,
          error: (error as Error).message,
        };
      }
    },
    [createSecureHeaders, makeRequest]
  );

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  // Verificar si el usuario está autenticado
  const isAuthenticated = useCallback(async (): Promise<boolean> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session?.access_token;
  }, []);

  // Obtener información del usuario actual
  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  }, []);

  // Refrescar token si es necesario
  const refreshAuth = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    return { session: data.session, error };
  }, []);

  return {
    // Métodos principales
    protectedGet,
    protectedPost,
    secureGet,
    securePost,

    // Utilidades
    isAuthenticated,
    getCurrentUser,
    refreshAuth,
  };
};

// ========================================
// TIPOS EXPORTADOS
// ========================================

export type { ApiResponse, RequestOptions };

// ========================================
// EJEMPLOS DE USO
// ========================================

/*
// Ejemplo 1: Enviar email (PROTECTED - solo API Key)
const { protectedPost } = useSecureApi();
const result = await protectedPost('/email/send', {
  to: 'user@example.com',
  subject: 'Bienvenido',
  template: 'welcome'
});

// Ejemplo 2: Obtener variables de entorno (SECURE - JWT + API Key)
const { secureGet } = useSecureApi();
const envVars = await secureGet('/config/variables');

// Ejemplo 3: Crear subasta (SECURE - JWT + API Key)
const { securePost } = useSecureApi();
const newAuction = await securePost('/auctions/create', {
  title: 'Nueva Subasta',
  startingPrice: 100,
  duration: '24h'
});

// Ejemplo 4: Verificar autenticación
const { isAuthenticated } = useSecureApi();
const isLoggedIn = await isAuthenticated();
*/
