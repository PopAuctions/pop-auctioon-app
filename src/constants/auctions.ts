import { AuctionCategories, AuctionModeEnum } from '@/types/types';

export const LIVE_URL: Record<AuctionModeEnum, string> = {
  AUTOMATIC: '/live-auto',
  LIVE: '/live',
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

export const SELECTABLE_AUCTION_CATEGORIES = [
  'BAGS',
  'JEWERLY',
  'WATCHES',
  'ART',
] as const satisfies readonly Exclude<AuctionCategories, 'ALL'>[];

export const MIN_DAYS_TO_START_AUCTION = 10;
