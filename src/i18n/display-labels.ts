import type { ArticleStatus } from '@/constants/articles';
import type { UserPaymentStatus } from '@/constants/payment';
import type {
  ArticleSecondChanceStatus,
  OfferStatus,
  StorePayoutMethodType,
  StorePayoutStatusType,
  StoreSettlementSaleTypeType,
} from '@/types/types';

/**
 * Connects user-facing dictionary labels to their canonical domain values.
 * Adding a new status or method requires every locale to provide its label.
 */
export interface DisplayLabelDictionary {
  paymentStatus: Record<UserPaymentStatus, string>;
  articleStatus: Record<ArticleStatus, string>;
  onlineStoreArticleStatus: Record<ArticleSecondChanceStatus, string>;
  offerStatus: Record<OfferStatus, string>;
  saleType: Record<StoreSettlementSaleTypeType, string>;
  payoutMethod: Record<StorePayoutMethodType, string>;
  payoutStatus: Record<StorePayoutStatusType, string>;
}
