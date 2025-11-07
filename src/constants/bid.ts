export const MIN_BID_PERCENTAGE = 0.01;

export const TEN_PRECENT = 0.1;

export const TWENTY_FIVE_PERCENT = 0.25;

export const FIFTY_PERCENT = 0.5;

export const MAX_BID_OFFSET = 100;

export const LOW_VALUE_GAP_THRESHOLD = 20;

export const BIDDING_UNITS = {
  low: 1, // startingPrice < 10
  medium: 5, // startingPrice < 100
  high: 10, // startingPrice >= 100
} as const;
