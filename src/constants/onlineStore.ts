import { ArticleSecondChanceStatus } from '@/types/types';

export const SORT_BY = {
  es: [
    { value: 'NEWEST', label: 'Más reciente' },
    { value: 'OLDEST', label: 'Más antiguo' },
    { value: 'HIGHER_PRICE', label: 'Mayor precio' },
    { value: 'LOWER_PRICE', label: 'Menor precio' },
  ],
  en: [
    { value: 'NEWEST', label: 'Newest' },
    { value: 'OLDEST', label: 'Oldest' },
    { value: 'HIGHER_PRICE', label: 'Higher price' },
    { value: 'LOWER_PRICE', label: 'Lower price' },
  ],
};

export const OFFERS_OPTIONS_VALUES = {
  ALL: 'ALL',
  WITH_ACCEPTED_OFFERS: 'WITH_ACCEPTED_OFFERS',
  WITH_PENDING_OFFERS: 'WITH_PENDING_OFFERS',
  WITHOUT_OFFERS: 'WITHOUT_OFFERS',
} as const;

export const ArticleSecondChanceStatusConst: Record<
  ArticleSecondChanceStatus,
  string
> = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
} as const;

export const ONLINE_STORE_ARTICLE_STATUS_LABELS: {
  es: Record<ArticleSecondChanceStatus, string>;
  en: Record<ArticleSecondChanceStatus, string>;
} = {
  es: {
    NOT_AVAILABLE: 'No disponible',
    AVAILABLE: 'Disponible',
    SOLD: 'Vendido',
  },
  en: {
    NOT_AVAILABLE: 'Not available',
    AVAILABLE: 'Available',
    SOLD: 'Sold',
  },
};
