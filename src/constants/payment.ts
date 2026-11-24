import type { CountryValue } from '@/types/types';

export enum UserPaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ========================================
// PAYMENT FILTERS
// ========================================

export enum PaidFilterValues {
  ALL = 'ALL',
  NOT_PAID = 'NOT_PAID',
  PAID_NOT_SHIPPED = 'PAID_NOT_SHIPPED',
  PAID_SHIPPED = 'PAID_SHIPPED',
}

export const PAID_FILTER_VALUE_ORDER = [
  PaidFilterValues.ALL,
  PaidFilterValues.NOT_PAID,
  PaidFilterValues.PAID_NOT_SHIPPED,
  PaidFilterValues.PAID_SHIPPED,
] as const;

// ========================================
// COUNTRIES DATA
// ========================================

/**
 * Array of supported country codes for payments and addresses
 */
export const COUNTRIES_ARRAY = [
  'ANDORRA',
  'AUSTRIA',
  'BELGIUM',
  'BULGARIA',
  'CROATIA',
  'CYPRUS',
  'CZECH_REPUBLIC',
  'DENMARK',
  'SPAIN',
  'ESTONIA',
  'FINLAND',
  'FRANCE',
  'GERMANY',
  'GREECE',
  'HUNGARY',
  'IRELAND',
  'ITALY',
  'LATVIA',
  'LITHUANIA',
  'LUXEMBOURG',
  'MALTA',
  'NETHERLANDS',
  'POLAND',
  'PORTUGAL',
  'ROMANIA',
  'SLOVAKIA',
  'SLOVENIA',
  'SWEDEN',
] as const satisfies readonly CountryValue[];
