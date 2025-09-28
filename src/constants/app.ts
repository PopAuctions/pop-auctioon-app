/**
 * Constantes generales de la aplicación
 * Incluye regex, límites, duraciones y configuraciones básicas
 */

import { RequestStatus } from '@/types/types';

export const LOCALE_PATTERN = /\/(?:es|en)/g;

export const VALID_URL_REGEX =
  /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const ONE_MB = 1 * 1024 * 1024;

export const MIN_MONTH_OFFSET = 1;

export const MAX_MONTH_OFFSET = 6;

export const CHAT_MAX_LENGTH = 128;

// minutes
export const CHAT_SESSION_DURATION = 180;

export const MIN_USER_PASSWORD_LENGTH = 8;

export const MIN_USERNAME_LENGTH = 3;

export const MAX_USERNAME_LENGTH = 10;

export const ACCEPTED_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const BLOG_ARTICLE_MAX_TITLE_LENGTH = 110;
export const BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH = 250;

export const ONLY_INTEGERS_REGEX = /^\d+$/;
export const ONLY_INTEGERS_EMPTY_REGEX = /^\d*$/;

export const ESCAPE_KEY = 'Escape';

export const ARTICLE_PRICE_FILTER_LIST = [
  { value: '1-100', label: '1€ - 100€' },
  { value: '100-500', label: '100€ - 500€' },
  { value: '500-1000', label: '500€ - 1000€' },
  { value: '1000-2000', label: '1000€ - 2000€' },
  { value: '>2000', label: '> 2000€' },
];

export const REQUEST_STATUS: Record<RequestStatus, string> = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};
