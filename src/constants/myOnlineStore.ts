import { OfferStatus } from '@/types/types';

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COUNTERED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};
