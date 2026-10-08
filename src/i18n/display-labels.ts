import type {
  ArticleColorValue,
  ArticleMaterialValue,
  ArticleStatus,
  BoxMaterialValue,
  StrapMaterialValue,
} from '@/constants/articles';
import type { UserPaymentStatus } from '@/constants/payment';
import type {
  ArticleSecondChanceStatus,
  OfferStatus,
  StorePayoutMethodType,
  StorePayoutStatusType,
  StoreSettlementSaleTypeType,
} from '@/types/types';
import type { Database } from '@/types/supabase';

type ArticleState = Database['public']['Enums']['ArticleState'];
type ArticleSmell = Database['public']['Enums']['ArticleSmell'];

interface ArticleSpecificationLabels {
  state: Record<ArticleState, string>;
  stateDescription: Record<ArticleState, string>;
  smell: Record<ArticleSmell, string>;
  movement: Record<string, string>;
  artType: Record<string, string>;
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
  paymentStatus: Record<UserPaymentStatus, string>;
  articleStatus: Record<ArticleStatus, string>;
  onlineStoreArticleStatus: Record<ArticleSecondChanceStatus, string>;
  offerStatus: Record<OfferStatus, string>;
  saleType: Record<StoreSettlementSaleTypeType, string>;
  payoutMethod: Record<StorePayoutMethodType, string>;
  payoutStatus: Record<StorePayoutStatusType, string>;
  articleSpecification: ArticleSpecificationLabels;
}
