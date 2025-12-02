import { AuctionCategories, AuctionModeEnum, Lang } from '@/types/types';

export const LIVE_URL: Record<AuctionModeEnum, string> = {
  AUTOMATIC: '/live-auto/',
  LIVE: '/live/',
};

export const AUCTION_MODE_LABEL: Record<
  Lang,
  Record<AuctionModeEnum, string>
> = {
  es: {
    AUTOMATIC: 'Subasta automática',
    LIVE: 'Subasta en vivo',
  },
  en: {
    AUTOMATIC: 'Automatic auction',
    LIVE: 'Live auction',
  },
};

export enum AuctionStatus {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  NEED_CHANGES = 'NEED_CHANGES',
  CHANGES_MADE = 'CHANGES_MADE',
  PARTIALLY_AVAILABLE = 'PARTIALLY_AVAILABLE',
  PARTIALLY_AVAILABLE_CHANGES_MADE = 'PARTIALLY_AVAILABLE_CHANGES_MADE',
  AVAILABLE = 'AVAILABLE',
  IN_REVIEW = 'IN_REVIEW',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  WAITING_MIN_ARTICLES_AMOUNT = 'WAITING_MIN_ARTICLES_AMOUNT',
}

export const AUCTION_STATUS_LABEL = {
  es: {
    NOT_AVAILABLE: 'No disponible',
    NEED_CHANGES: 'Necesita cambios',
    CHANGES_MADE: 'Cambios realizados',
    PARTIALLY_AVAILABLE: 'Parcialmente disponible',
    PARTIALLY_AVAILABLE_CHANGES_MADE:
      'Parcialmente disponible | Cambios realizados',
    AVAILABLE: 'Disponible',
    LIVE: 'En vivo',
    FINISHED: 'Finalizada',
    IN_REVIEW: 'En revisión',
    WAITING_MIN_ARTICLES_AMOUNT:
      'Esperando cantidad mínima de artículos correctos',
  },
  en: {
    NOT_AVAILABLE: 'Not available',
    NEED_CHANGES: 'Needs changes',
    CHANGES_MADE: 'Changes made',
    PARTIALLY_AVAILABLE: 'Partially available',
    PARTIALLY_AVAILABLE_CHANGES_MADE: 'Partially available | Changes made',
    AVAILABLE: 'Available',
    LIVE: 'Live',
    FINISHED: 'Finished',
    IN_REVIEW: 'In review',
    WAITING_MIN_ARTICLES_AMOUNT:
      'Waiting for minimum amount of correct articles',
  },
};

export const AUCTION_CATEGORIES_LABEL: Record<
  Lang,
  Record<AuctionCategories, string>
> = {
  es: {
    BAGS: 'Bolsos',
    JEWERLY: 'Joyas',
    WATCHES: 'Relojes',
    ART: 'Arte',
  },
  en: {
    BAGS: 'Bags',
    JEWERLY: 'Jewelry',
    WATCHES: 'Watches',
    ART: 'Art',
  },
};
