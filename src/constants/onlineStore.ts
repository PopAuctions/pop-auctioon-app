import type { ArticleSecondChanceStatus } from '@/types/types';

export const SORT_BY_VALUES = [
  'NEWEST',
  'OLDEST',
  'HIGHER_PRICE',
  'LOWER_PRICE',
] as const;

export type SortByValue = (typeof SORT_BY_VALUES)[number];

export const OFFERS_OPTIONS_VALUES = {
  ALL: 'ALL',
  WITH_ACCEPTED_OFFERS: 'WITH_ACCEPTED_OFFERS',
  WITH_PENDING_OFFERS: 'WITH_PENDING_OFFERS',
  WITHOUT_OFFERS: 'WITHOUT_OFFERS',
} as const;

export const OFFERS_OPTION_VALUE_ORDER = [
  OFFERS_OPTIONS_VALUES.ALL,
  OFFERS_OPTIONS_VALUES.WITH_ACCEPTED_OFFERS,
  OFFERS_OPTIONS_VALUES.WITH_PENDING_OFFERS,
  OFFERS_OPTIONS_VALUES.WITHOUT_OFFERS,
] as const;

export const ArticleSecondChanceStatusConst: Record<
  ArticleSecondChanceStatus,
  string
> = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
} as const;
