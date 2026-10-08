import type {
  ArticleColorValue,
  ArticleMaterialValue,
  ArticleSmellValue,
  ArticleStateValue,
  ArticleStatus,
  ArtTypeValue,
  BoxMaterialValue,
  StrapMaterialValue,
  WatchMovementValue,
} from '@/constants/articles';
import type { PaidFilterValues, UserPaymentStatus } from '@/constants/payment';
import type { SortByValue } from '@/constants/onlineStore';
import type { AuctionStatus } from '@/constants/auctions';
import type { CalendarMonthKey } from '@/constants/months';
import type {
  ArticleSecondChanceStatus,
  AuctionCategories,
  AuctionModeEnum,
  OfferStatus,
  OffersOptionValue,
  StorePayoutMethodType,
  StorePayoutStatusType,
  StoreSettlementSaleTypeType,
} from '@/types/types';

interface ArticleSpecificationLabels {
  state: Record<ArticleStateValue, string>;
  stateDescription: Record<ArticleStateValue, string>;
  smell: Record<ArticleSmellValue, string>;
  movement: Record<WatchMovementValue, string>;
  artType: Record<ArtTypeValue, string>;
  color: Record<ArticleColorValue, string>;
  boxMaterial: Record<BoxMaterialValue, string>;
  material: Record<ArticleMaterialValue, string>;
  strapMaterial: Record<StrapMaterialValue, string>;
}

/**
 * Connects user-facing dictionary labels to their canonical domain values.
 * Adding a new status or method requires every locale to provide its label.
 */
export interface DisplayLabelDictionary {
  auctionMode: Record<AuctionModeEnum, string>;
  auctionStatus: Record<AuctionStatus, string>;
  auctionCategory: Record<AuctionCategories, string>;
  calendarMonth: Record<CalendarMonthKey, string>;
  paymentStatus: Record<UserPaymentStatus, string>;
  articleStatus: Record<ArticleStatus, string>;
  onlineStoreArticleStatus: Record<ArticleSecondChanceStatus, string>;
  offerStatus: Record<OfferStatus, string>;
  saleType: Record<StoreSettlementSaleTypeType, string>;
  payoutMethod: Record<StorePayoutMethodType, string>;
  payoutStatus: Record<StorePayoutStatusType, string>;
  sortBy: Record<SortByValue, string>;
  paidFilter: Record<PaidFilterValues, string>;
  offersFilter: Record<OffersOptionValue, string>;
  auctionCategorySelection: Record<Exclude<AuctionCategories, 'ALL'>, string>;
  articleSpecification: ArticleSpecificationLabels;
}
