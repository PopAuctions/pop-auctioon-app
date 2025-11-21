import { useCallback } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import {
  API_CONFIG,
  HEADERS_CONFIG,
  DEV_CONFIG,
  buildProtectedUrl,
  buildSecureUrl,
} from '@/config/api-config';
import { ApiEndpoint, LangMap } from '@/types/types';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

interface ApiResponse<T = any> {
  data: T;
  error: LangMap;
  responseText: string;
  status: number;
  contentType: string;
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
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      return baseHeaders;
    }

    return {
      ...baseHeaders,
      [HEADERS_CONFIG.AUTHORIZATION_HEADER]: `Bearer ${accessToken}`,
    };
  }, [createBaseHeaders]);

  // Función auxiliar para hacer requests HTTP
  const makeRequest = useCallback(
    async <T>(
      url: string,
      options: RequestInit,
      requestOptions: RequestOptions = {},
      parseJson: boolean = true
    ): Promise<Partial<ApiResponse<T>>> => {
      const { timeout = API_CONFIG.TIMEOUT, retries = API_CONFIG.MAX_RETRIES } =
        requestOptions;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          if (DEV_CONFIG.ENABLE_REQUEST_LOGGING) {
            console.log(`🚀 API Request: ${options.method} ${url}`);
          }

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // We’ll use this clone for text/json parsing when needed
          const responseClone = response.clone();

          // Helper to build a default LangMap error
          const defaultError: LangMap = {
            es: 'Error al obtener información',
            en: 'Error getting information',
          };

          const getErrorMessage = (data: unknown): LangMap => {
            if (data && typeof data === 'object' && 'error' in data) {
              const anyData = data as any;

              if (anyData.error && typeof anyData.error === 'object') {
                return anyData.error as LangMap;
              }

              if (typeof anyData.error === 'string') {
                return {
                  en: anyData.error,
                  es: anyData.error,
                };
              }
            }

            return defaultError;
          };

          // 🔹 BINARY / NON-JSON MODE (parseJson === false)
          if (!parseJson) {
            const contentType =
              response.headers.get('content-type') || 'unknown';

            // ✅ Success: return raw binary (ArrayBuffer)
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();

              if (DEV_CONFIG.ENABLE_RESPONSE_LOGGING) {
                console.log(`✅ API Binary Response: ${response.status}`, {
                  contentType,
                  size: arrayBuffer.byteLength,
                });
              }

              return {
                data: arrayBuffer as T,
                status: response.status,
                error: undefined,
                contentType,
              };
            }

            // ❌ Error: try to parse JSON error, then text
            let errorMessage = defaultError;
            let responseText = '';

            try {
              const maybeJson = await responseClone.json();
              errorMessage = getErrorMessage(maybeJson);
            } catch {
              try {
                const textResponse = await responseClone.text();
                const safeText =
                  typeof textResponse === 'string' ? textResponse : '';
                responseText =
                  safeText.substring(0, 200) +
                  (safeText.length > 200 ? '...' : '');
              } catch {
                // ignore – keep default error + empty responseText
              }
            }

            if (DEV_CONFIG.ENABLE_RESPONSE_LOGGING) {
              console.log(`⚠️ API Binary Error Response: ${response.status}`, {
                errorMessage,
                responseText,
                contentType,
              });
            }

            return {
              data: undefined,
              status: response.status,
              error: errorMessage,
              responseText,
              contentType,
            };
          }

          // 🔹 JSON MODE (parseJson === true) – your original logic
          let responseData: Partial<ApiResponse<T>>;
          try {
            responseData = await response.json();
          } catch {
            const textResponse = await responseClone.text();
            const safeText =
              typeof textResponse === 'string' ? textResponse : '';

            responseData = {
              error: defaultError,
              responseText:
                safeText.substring(0, 200) +
                (safeText.length > 200 ? '...' : ''),
              contentType: response.headers.get('content-type') || 'unknown',
            };
          }

          if (DEV_CONFIG.ENABLE_RESPONSE_LOGGING) {
            console.log(`✅ API Response: ${response.status}`, responseData);
          }

          return {
            data: responseData.data as T | undefined,
            status: response.status,
            error: response.ok ? undefined : getErrorMessage(responseData),
          };
        } catch (error) {
          if (DEV_CONFIG.ENABLE_REQUEST_LOGGING) {
            console.error(`❌ API Error (attempt ${attempt + 1}):`, error);
          }

          if (attempt === retries) {
            break;
          }

          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.min(
                Math.pow(2, attempt) * API_CONFIG.RETRY_DELAY,
                API_CONFIG.RETRY_DELAY_CAP
              )
            )
          );
        }
      }

      return {
        status: 0,
        error: {
          es: 'Error al conectar con el servidor',
          en: 'Error connecting to server',
        },
      };
    },
    []
  );

  // ========================================
  // MÉTODOS PROTEGIDOS (Solo API Key)
  // ========================================

  const protectedGet = useCallback(
    async <T>({
      endpoint,
      options = {},
      secureHeader = false,
    }: {
      endpoint: ApiEndpoint;
      options?: RequestOptions;
      secureHeader?: boolean;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = secureHeader
          ? await createSecureHeaders()
          : createBaseHeaders();
        const url = buildProtectedUrl(endpoint);

        return makeRequest<T>(
          url,
          {
            method: 'GET',
            headers,
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - protectedGet failed`);
        return {
          status: 400,
          error: {
            es: 'Error al obtener información',
            en: 'Error getting information',
          },
        };
      }
    },
    [createBaseHeaders, makeRequest, createSecureHeaders]
  );

  const protectedPost = useCallback(
    async <T>({
      endpoint,
      data = {},
      options = {},
    }: {
      endpoint: ApiEndpoint;
      data?: any;
      options?: RequestOptions;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = createBaseHeaders();
        const url = buildProtectedUrl(endpoint);

        return makeRequest<T>(
          url,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - protectedPost failed`);
        return {
          status: 400,
          error: {
            es: 'Error al obtener información',
            en: 'Error getting information',
          },
        };
      }
    },
    [createBaseHeaders, makeRequest]
  );

  const protectedPatch = useCallback(
    async <T>({
      endpoint,
      data = {},
      options = {},
    }: {
      endpoint: ApiEndpoint;
      data?: any;
      options?: RequestOptions;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = createBaseHeaders();
        const url = buildProtectedUrl(endpoint);

        return makeRequest<T>(
          url,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - protectedPatch failed`);
        return {
          status: 400,
          error: {
            es: 'Error al actualizar información',
            en: 'Error updating information',
          },
        };
      }
    },
    [createBaseHeaders, makeRequest]
  );

  const protectedDelete = useCallback(
    async <T>({
      endpoint,
      options = {},
    }: {
      endpoint: ApiEndpoint;
      options?: RequestOptions;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = createBaseHeaders();
        const url = buildProtectedUrl(endpoint);

        return makeRequest<T>(
          url,
          {
            method: 'DELETE',
            headers,
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - protectedDelete failed`);
        return {
          status: 400,
          error: {
            es: 'Error al eliminar información',
            en: 'Error deleting information',
          },
        };
      }
    },
    [createBaseHeaders, makeRequest]
  );

  // ========================================
  // MÉTODOS SEGUROS (JWT + API Key)
  // ========================================

  const secureGet = useCallback(
    async <T>({
      endpoint,
      options = {},
      parseJson = true,
    }: {
      endpoint: ApiEndpoint;
      options?: RequestOptions;
      parseJson?: boolean;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = await createSecureHeaders();
        const url = buildSecureUrl(endpoint);

        return makeRequest<T>(
          url,
          {
            method: 'GET',
            headers,
          },
          options,
          parseJson
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - secureGet failed`);
        return {
          status: 400,
          error: {
            es: 'Error al obtener información',
            en: 'Error getting information',
          },
        };
      }
    },
    [createSecureHeaders, makeRequest]
  );

  const securePost = useCallback(
    async <T>({
      endpoint,
      data = {},
      options = {},
    }: {
      endpoint: ApiEndpoint;
      data?: any;
      options?: RequestOptions;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = await createSecureHeaders();
        const url = buildSecureUrl(endpoint);

        // Detectar si data es FormData
        const isFormData = data instanceof FormData;

        // Si es FormData, no agregar Content-Type (fetch lo establece automáticamente)
        // y no usar JSON.stringify
        const requestHeaders = isFormData
          ? Object.fromEntries(
              Object.entries(headers).filter(
                ([key]) => key !== HEADERS_CONFIG.CONTENT_TYPE_HEADER
              )
            )
          : headers;

        return makeRequest<T>(
          url,
          {
            method: 'POST',
            headers: requestHeaders,
            body: isFormData ? data : JSON.stringify(data),
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - securePost failed`);
        return {
          status: 400,
          error: {
            es: 'Error al obtener información',
            en: 'Error getting information',
          },
        };
      }
    },
    [createSecureHeaders, makeRequest]
  );

  const securePatch = useCallback(
    async <T>({
      endpoint,
      data = {},
      options = {},
    }: {
      endpoint: ApiEndpoint;
      data?: any;
      options?: RequestOptions;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = await createSecureHeaders();
        const url = buildSecureUrl(endpoint);

        // Detectar si data es FormData
        const isFormData = data instanceof FormData;

        // Si es FormData, no agregar Content-Type (fetch lo establece automáticamente)
        // y no usar JSON.stringify
        const requestHeaders = isFormData
          ? Object.fromEntries(
              Object.entries(headers).filter(
                ([key]) => key !== HEADERS_CONFIG.CONTENT_TYPE_HEADER
              )
            )
          : headers;

        return makeRequest<T>(
          url,
          {
            method: 'PATCH',
            headers: requestHeaders,
            body: isFormData ? data : JSON.stringify(data),
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - securePatch failed`);
        return {
          status: 400,
          error: {
            es: 'Error al actualizar información',
            en: 'Error updating information',
          },
        };
      }
    },
    [createSecureHeaders, makeRequest]
  );

  const secureDelete = useCallback(
    async <T>({
      endpoint,
      options = {},
    }: {
      endpoint: ApiEndpoint;
      options?: RequestOptions;
    }): Promise<Partial<ApiResponse<T>>> => {
      try {
        const headers = await createSecureHeaders();
        const url = buildSecureUrl(endpoint);

        return makeRequest<T>(
          url,
          {
            method: 'DELETE',
            headers,
          },
          options
        );
      } catch (error) {
        sentryErrorReport(error, `${endpoint} - secureDelete failed`);
        return {
          status: 400,
          error: {
            es: 'Error al eliminar información',
            en: 'Error deleting information',
          },
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
    protectedPatch,
    protectedDelete,
    secureGet,
    securePost,
    securePatch,
    secureDelete,

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
const result = await protectedPost({
  endpoint: '/email/send',
  data: {
    to: 'user@example.com',
    subject: 'Bienvenido',
    template: 'welcome'
  }
});

// Ejemplo 2: Obtener variables de entorno (SECURE - JWT + API Key)
const { secureGet } = useSecureApi();
const envVars = await secureGet({ endpoint: '/config/variables' });

// Ejemplo 3: Crear subasta (SECURE - JWT + API Key)
const { securePost } = useSecureApi();
const newAuction = await securePost({
  endpoint: '/auctions/create',
  data: {
    title: 'Nueva Subasta',
    startingPrice: 100,
    duration: '24h'
  }
});

// Ejemplo 4: Actualizar billing address (SECURE PATCH - JWT + API Key)
const { securePatch } = useSecureApi();
const updated = await securePatch({
  endpoint: '/user/billing/123',
  data: {
    address: '456 New St',
    city: 'New City'
  }
});

// Ejemplo 5: Eliminar billing address (SECURE DELETE - JWT + API Key)
const { secureDelete } = useSecureApi();
const deleted = await secureDelete({
  endpoint: '/user/billing/123'
});

// Ejemplo 6: Verificar autenticación
const { isAuthenticated } = useSecureApi();
const isLoggedIn = await isAuthenticated();
*/
