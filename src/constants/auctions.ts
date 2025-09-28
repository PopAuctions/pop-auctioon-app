import { AuctionModeEnum, Lang } from '@/types/types';

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
