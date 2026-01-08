/**
 * Configuración centralizada para API Segura
 * Contiene endpoints, constantes y configuraciones para la comunicación con Next.js
 */

import { ApiEndpoint } from '@/types/types';

// ========================================
// CONFIGURACIÓN BASE
// ========================================

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
  TIMEOUT: 10000, // 10 segundos
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000, // 1 segundo base para exponential backoff
  RETRY_DELAY_CAP: 10000, // Máximo 10 segundos de delay entre reintentos
} as const;

// ========================================
// ENDPOINTS PROTEGIDOS (Solo API Key)
// ========================================

export const PROTECTED_ENDPOINTS = {
  // Email y notificaciones
  EMAIL: {
    SEND: '/email/send',
    VERIFY: '/email/verify',
    TEMPLATE: '/email/template',
  },

  // Notificaciones push
  NOTIFICATIONS: {
    SEND: '/notifications/push',
    REGISTER: '/notifications/register',
    UNREGISTER: '/notifications/unregister',
  },

  // Tokens y autenticación básica
  TOKENS: {
    REFRESH: '/tokens/refresh',
    VALIDATE: '/tokens/validate',
    REVOKE: '/tokens/revoke',
  },

  // Analytics y telemetría
  ANALYTICS: {
    EVENT: '/analytics/event',
    CRASH: '/analytics/crash',
    PERFORMANCE: '/analytics/performance',
  },

  // Chat (IVS Chat)
  CHAT: {
    GET_TOKEN: '/chat/get-token',
  },

  // Payment (solo comisión pública)
  PAYMENT: {
    COMMISSIONS: '/payments/commission', // GET - Solo valor de comisión
  },

  // Legal content (Terms, Privacy, Cookies)
  LEGAL: {
    CONTENT: '/legal', // GET - Todo el contenido legal (cookies, privacy, terms PDF)
  },

  // Info content (About Us, How It Works, FAQs)
  INFO: {
    CONTENT: '/info', // GET - Todo el contenido informativo (aboutUs, howItWorks, faqs)
  },

  // Contact Us form
  CONTACT_US: {
    SEND: '/contact-us', // POST - Enviar formulario de contacto
  },

  // Auth
  AUTH: {
    SIGNUP: '/auth/signup', // POST - Registro de usuario
  },
} as const;

// ========================================
// ENDPOINTS SEGUROS (JWT + API Key)
// ========================================

export const SECURE_ENDPOINTS = {
  // Configuración y variables de entorno
  CONFIG: {
    VARIABLES: '/config/variables',
    APP_SETTINGS: '/config/app-settings',
    FEATURE_FLAGS: '/config/feature-flags',
  },

  ARTICLES: {
    ID: (articleId: string | number): ApiEndpoint => `/articles/${articleId}`,
    FOLLOWED_ARTICLES: '/articles/followed',
    BUY: (articleId: string): ApiEndpoint =>
      `/articles/${articleId}/buy` as ApiEndpoint, // POST - Comprar artículo
    NEW_ARTICLE: (auctionId: string | number): ApiEndpoint =>
      `/auctions/${auctionId}/articles/new`,
    EDIT_ARTICLE: (
      auctionId: string | number,
      articleId: string | number
    ): ApiEndpoint => `/auctions/${auctionId}/articles/${articleId}/edit`,
    EDIT_ARTICLE_IMAGES_ORDER: (
      auctionId: string | number,
      articleId: string | number
    ): ApiEndpoint =>
      `/auctions/${auctionId}/articles/${articleId}/update-images-order`,
    COMMENTS: (
      auctionId: string | number,
      articleId: string | number
    ): ApiEndpoint => `/auctions/${auctionId}/articles/${articleId}/comments`,
  },
  MY_AUCTIONS: {
    LIST: '/my-auctions',
    OLD_LIST: '/my-auctions/old',
  },
  MY_ONLINE_STORE: {
    ARTICLES: '/my-online-store/articles',
  },
  // Subastas
  AUCTIONS: {
    LIST: '/auctions',
    CREATE: '/auctions/create',
    UPDATE: '/auctions/update',
    DELETE: '/auctions/delete',
    JOIN: '/auctions/join',
    BID: '/auctions/bid',
    DETAILS: '/auctions/details',
    FOLLOWED_AUCTIONS: '/auctions/followed',
    ARTICLES: (auctionId: string | number, params: string): ApiEndpoint =>
      `/auctions/${auctionId}/articles?${params}` as ApiEndpoint,
    REQUEST_REVIEW: (auctionId: string | number): ApiEndpoint =>
      `/auctions/${auctionId}/request-review` as ApiEndpoint,
    REORDER_MY_AUCTION_ARTICLES: (auctionId: string | number): ApiEndpoint =>
      `/auctions/${auctionId}/articles/update-order` as ApiEndpoint,
    TOGGLE_ARTICLE_FEATURED: (
      auctionId: string | number,
      articleId: string | number
    ): ApiEndpoint =>
      `/auctions/${auctionId}/articles/${articleId}/toggle-featured` as ApiEndpoint,
    REMOVE_ARTICLE: (
      auctionId: string | number,
      articleId: string | number
    ): ApiEndpoint =>
      `/auctions/${auctionId}/articles/${articleId}/remove` as ApiEndpoint,
  },

  // Usuario y perfil
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    EDIT_INFO: '/user/edit-user-info',
    PREFERENCES: '/user/preferences',
    HISTORY: '/user/history',
    FAVORITES: '/user/favorites',
    ADDRESSES: '/user/addresses',
    CREATE_ADDRESS: '/user/addresses/create',
    CURRENT_USER: '/user/current',
    BILLING: '/user/billing', // GET (list all) y POST (create new)
    BILLING_BY_ID: (id: string): ApiEndpoint =>
      `/user/billing/${id}` as ApiEndpoint, // PATCH (update) y DELETE
    PAYMENT_HISTORY: '/user/payments', // GET payment history
    PAYMENT_BY_ID: (id: string): ApiEndpoint =>
      `/user/payments/${id}` as ApiEndpoint, // GET payment by ID
    WON_ARTICLES: (auctionId: string): ApiEndpoint =>
      `/user/won-articles?auctionId=${auctionId}` as ApiEndpoint, // GET - Artículos ganados en subasta
    WON_ARTICLES_BY_AUCTION: '/user/won-articles-by-auction', // GET - Artículos ganados agrupados por subasta
    RESET_PASSWORD: '/user/reset-password', // POST - Reset password
    OTP: {
      SEND: '/user/otp/send', // POST - Enviar código OTP al teléfono
      VERIFY: '/user/otp/verify', // POST - Verificar código OTP
    },
    INVOICE: {
      CREATE: (id: string): ApiEndpoint => `/user/payments/${id}/invoice`, // POST - Crear nueva factura
      GET: (id: string): ApiEndpoint =>
        `/user/payments/${id}/invoice` as ApiEndpoint, // GET - Obtener factura por paymentID
    },
  },
  INVOICE: {
    GET: (id: string): ApiEndpoint =>
      `/invoice?paymentId=${id}&format=pdf` as ApiEndpoint, // GET - Obtener factura por paymentID
  },
  BIDS: {
    CREATE: '/bids',
  },
  LIVE: {
    ARTICLES: '/live/articles',
  },
  'NO-AUTH': {
    RESET_PASSWORD: '/reset-password', // POST - Reset password
  },

  // Server Actions y operaciones complejas
  ACTIONS: {
    CREATE_AUCTION: '/actions/create-auction',
    UPDATE_AUCTION: '/actions/update-auction',
    PROCESS_PAYMENT: '/actions/process-payment',
    SEND_MESSAGE: '/actions/send-message',
  },
  OFFERS: {
    CREATE: '/online-store/offers',
    MADE: '/user/offers-made',
  },

  // Payments (Stripe)
  PAYMENT: {
    CREATE_PAYMENT_INTENT: '/user/payments/create-intent', // POST - Create payment intent
    CREATE_ARTICLES_PAYMENT: '/user/payments/create-articles-payment', // POST - Create payment record in DB
    REJECT_ARTICLES_PAYMENT: '/user/payments/reject-articles-payment', // POST - Reject/revert payment on failure
    CREATE_SINGLE_ARTICLE_PAYMENT:
      '/user/payments/create-single-article-payment', // POST - Create payment record in DB
    REJECT_SINGLE_ARTICLE_PAYMENT:
      '/user/payments/reject-single-article-payment', // POST - Reject/revert payment on failure
    INFO: '/payment-info', // GET - Complete payment configuration (commission, taxes, countries)
  },

  // Discount codes
  DISCOUNT: {
    VALIDATE: (code: string): ApiEndpoint =>
      `/user/payments/discount-code?code=${encodeURIComponent(code)}` as ApiEndpoint, // GET - Validate discount code
  },

  // Proxy universal para endpoints existentes
  PROXY: {
    BASE: '/proxy', // Seguido de la ruta del endpoint original
  },
} as const;

// ========================================
// NIVELES DE SEGURIDAD
// ========================================

export const SECURITY_LEVELS = {
  PROTECTED: 'protected',
  SECURE: 'secure',
} as const;

export type SecurityLevel =
  (typeof SECURITY_LEVELS)[keyof typeof SECURITY_LEVELS];

// ========================================
// CONFIGURACIÓN DE HEADERS
// ========================================

export const HEADERS_CONFIG = {
  CONTENT_TYPE_HEADER: 'Content-Type',
  CONTENT_TYPE_VALUE: 'application/json',
  API_KEY_HEADER: 'X-API-Key',
  TIMESTAMP_HEADER: 'X-Timestamp',
  AUTHORIZATION_HEADER: 'Authorization',

  // Headers opcionales para debugging
  DEBUG_HEADERS: {
    REQUEST_ID: 'X-Request-ID',
    CLIENT_VERSION: 'X-Client-Version',
    PLATFORM: 'X-Platform',
  },
} as const;

// ========================================
// CONFIGURACIÓN DE RATE LIMITING
// ========================================

export const RATE_LIMITS = {
  PROTECTED: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000, // 1 minuto
  },
  SECURE: {
    MAX_REQUESTS: 200,
    WINDOW_MS: 60000, // 1 minuto
  },
} as const;

// ========================================
// CONFIGURACIÓN DE TIMEOUTS POR ENDPOINT
// ========================================

export const ENDPOINT_TIMEOUTS = {
  EMAIL_SEND: 5000,
  NOTIFICATION_PUSH: 3000,
  AUCTION_CREATE: 15000,
  FILE_UPLOAD: 30000,
  DEFAULT: API_CONFIG.TIMEOUT,
} as const;

// ========================================
// CÓDIGOS DE ERROR PERSONALIZADOS
// ========================================

export const API_ERROR_CODES = {
  // Errores de autenticación
  INVALID_API_KEY: 'INVALID_API_KEY',
  MISSING_JWT: 'MISSING_JWT',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Errores de rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Errores de validación
  INVALID_TIMESTAMP: 'INVALID_TIMESTAMP',
  MALFORMED_REQUEST: 'MALFORMED_REQUEST',
  MISSING_PARAMETERS: 'MISSING_PARAMETERS',

  // Errores de servidor
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// ========================================
// UTILIDADES PARA CONSTRUCCIÓN DE URLs
// ========================================

/**
 * Construye una URL completa para un endpoint protegido
 */
export const buildProtectedUrl = (endpoint: ApiEndpoint): string => {
  return `${API_CONFIG.BASE_URL}/mobile/${SECURITY_LEVELS.PROTECTED}${endpoint}`;
};

/**
 * Construye una URL completa para un endpoint seguro
 */
export const buildSecureUrl = (endpoint: ApiEndpoint): string => {
  return `${API_CONFIG.BASE_URL}/mobile/${SECURITY_LEVELS.SECURE}${endpoint}`;
};

/**
 * Construye una URL de proxy para acceder a endpoints existentes de forma segura
 */
export const buildProxyUrl = (originalPath: ApiEndpoint): string => {
  return `${API_CONFIG.BASE_URL}/mobile/${SECURITY_LEVELS.SECURE}/proxy${originalPath}`;
};

// ========================================
// CONFIGURACIÓN DE VALIDACIÓN
// ========================================

export const VALIDATION_CONFIG = {
  TIMESTAMP_TOLERANCE_MS: 300000, // 5 minutos
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ========================================
// TIPOS EXPORTADOS
// ========================================

// export interface ApiEndpoint {
//   url: string;
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
//   securityLevel: SecurityLevel;
//   timeout?: number;
// }

// export interface ApiConfig {
//   baseUrl: string;
//   apiKey: string;
//   timeout: number;
//   maxRetries: number;
//   retryDelay: number;
// }

// ========================================
// CONSTANTES DE DESARROLLO
// ========================================

export const DEV_CONFIG = {
  ENABLE_REQUEST_LOGGING: __DEV__,
  ENABLE_RESPONSE_LOGGING: __DEV__,
  ENABLE_ERROR_ALERTS: __DEV__,
  MOCK_NETWORK_DELAY: 0, // ms, para simular latencia en desarrollo
} as const;

// ========================================
// EJEMPLOS DE USO
// ========================================

/*
// Ejemplo 1: Usar endpoints protegidos
import { PROTECTED_ENDPOINTS, buildProtectedUrl } from '@/config/api-config';

const emailUrl = buildProtectedUrl(PROTECTED_ENDPOINTS.EMAIL.SEND);
// Resultado: "http://localhost:3000/api/protected/email/send"

// Ejemplo 2: Usar endpoints seguros
import { SECURE_ENDPOINTS, buildSecureUrl } from '@/config/api-config';

const auctionUrl = buildSecureUrl(SECURE_ENDPOINTS.AUCTIONS.CREATE);
// Resultado: "http://localhost:3000/api/secure/auctions/create"

// Ejemplo 3: Usar proxy para endpoints existentes
import { buildProxyUrl } from '@/config/api-config';

const proxyUrl = buildProxyUrl('/api/existing-endpoint');
// Resultado: "http://localhost:3000/api/secure/proxy/api/existing-endpoint"
*/
