import { type Database } from '@/types/supabase';

export type Lang = 'es' | 'en';

export type UserRoles = 'ADMIN' | 'USER' | 'AUCTIONEER' | 'HOST_AUCTIONEER';

export interface UserRolesTypes {
  admin: 'ADMIN';
  user: 'USER';
  auctioneer: 'AUCTIONEER';
  hostAuctioneer: 'HOST_AUCTIONEER';
}

export type User = Database['public']['Tables']['User']['Row'];

export type DiscountCode = Database['public']['Tables']['DiscountCode']['Row'];

export type PhoneOTP = Database['public']['Tables']['PhoneOTP']['Row'];

export type UserDiscountCode =
  Database['public']['Tables']['UserDiscountCode']['Row'];

export type ArticleOffer = Database['public']['Tables']['ArticleOffer']['Row'];

export type Bids = Database['public']['Tables']['Bids']['Row'] & {
  User: Pick<User, 'username' | 'profilePicture'>;
};

export type Auction = Database['public']['Tables']['Auction']['Row'];

export type AuctionModeEnum = Database['public']['Enums']['AuctionMode'];

export const AuctionMode: Record<AuctionModeEnum, AuctionModeEnum> = {
  LIVE: 'LIVE',
  AUTOMATIC: 'AUTOMATIC',
} as const;

export type Article = Database['public']['Tables']['Article']['Row'] & {
  ArticleBid: Pick<
    ArticleBid,
    | 'currentValue'
    | 'available'
    | 'highestBidderUsername'
    | 'highestBidderImage'
  >;
};

export type BlogArticle = Database['public']['Tables']['BlogArticle']['Row'];

export interface BlogArticleJson {
  en: string;
  es: string;
}
export interface BlogArticleJsonArray {
  en: string[];
  es: string[];
}

export type UserIVS = Database['public']['Tables']['UserIVS']['Row'];

export type ArticleBid = Database['public']['Tables']['ArticleBid']['Row'];

export type UserAddress = Database['public']['Tables']['UserAddress']['Row'];

export type Invoice = Database['public']['Tables']['Invoice']['Row'];

export type InvoiceTypeEnum = Database['public']['Enums']['InvoiceType'];

export const InvoiceType: Record<InvoiceTypeEnum, InvoiceTypeEnum> = {
  USER: 'USER',
  AUCTIONEER: 'AUCTIONEER',
  HOST_AUCTIONEER: 'HOST_AUCTIONEER',
} as const;

export type GeneratedInvoice = Pick<
  Invoice,
  | 'billingAddress'
  | 'billingName'
  | 'commission'
  | 'correlativeNumber'
  | 'createdAt'
  | 'discount'
  | 'invoiceId'
  | 'issuedAt'
  | 'items'
  | 'shipping'
  | 'subtotal'
  | 'taxes'
  | 'total'
  | 'vatNumber'
>;

export type UserBillingInfo =
  Database['public']['Tables']['UserBillingInfo']['Row'];

export type ArticleSecondChance =
  Database['public']['Tables']['ArticleSecondChance']['Row'];

export interface CustomArticleSecondChance {
  id: number;
  userId?: string;
  expiresAt?: Date;
  price: number;
  status?: ArticleSecondChanceStatus;
  Article: Pick<Article, 'id' | 'images' | 'title' | 'brand'>;
  ArticleOffer?: Pick<ArticleOffer, 'id' | 'status' | 'createdAt'>[];
}

export interface CustomArticleSecondChancePayment {
  id: number;
  userId?: string;
  expiresAt?: Date;
  amount: number;
  status?: ArticleSecondChanceStatus;

  ArticleSecondChance: Pick<ArticleSecondChance, 'id'> & {
    Article: Pick<Article, 'id'>;
  };
}

export interface CustomArticleOffer {
  id: number;
  amount: number;
  status: OfferStatus;
  expiresAt: string;
  userId: string;
  ArticleSecondChance: Pick<ArticleSecondChance, 'id' | 'status'> & {
    Article: Pick<Article, 'id' | 'images' | 'title' | 'brand'>;
  };
}

export interface CustomFullArticleSecondChance {
  id: number;
  price: number;
  status: ArticleSecondChanceStatus;
  Article: Article;
  ArticleOffer?: Pick<
    ArticleOffer,
    'id' | 'amount' | 'expiresAt' | 'status' | 'createdAt'
  >[];
}

export type UserArticlesWon = Pick<
  Article,
  'id' | 'title' | 'brand' | 'soldPrice'
> & { image: string };

export interface AuctionUserWonArticles {
  createdAt: string;
  title: string;
  articles: CustomArticle[];
}

export interface UserPayment {
  id: number;
  createdAt: string;
  status: string;
  receiptUrl?: string;
  articlesPaid: number[];
  totalAmount: number;
  taxesAmount?: number;
  shippingAmount?: number;
  commissionAmount?: number;
  discountAmount?: number;
  articlesAmount?: number;
  description?: string;
  errorCode?: string | null;
  paymentIntent?: string | null;
  chargeId?: string | null;
  discountCode?: string | null;
  shippingNumber?: string | null;
  shippingCourier?: string | null;
  auctionId?: number | null;
  userAddressId?: string | null;
  auction: {
    id: number;
    title: string;
    startDate: Date;
  } | null;
  articles: CustomArticle[];
  userAddress?: UserAddress;
  user: Partial<User>;
}

export type ArticleOwner = Pick<
  User,
  'id' | 'storeName' | 'email' | 'name' | 'lastName' | 'phoneNumber'
>;

export interface CustomArticle {
  id: number;
  title: string;
  auctionId: number;
  soldPrice: number;
  brand: string;
  images: string[];
}

export interface CustomAuction {
  id: string;
  title: string;
  startDate: string;
  image: string;
}

export type LiveAuction = Database['public']['Tables']['LiveAuction']['Row'] & {
  ArticleBid: Pick<
    ArticleBid,
    | 'articleId'
    | 'highestBidderUsername'
    | 'highestBidderImage'
    | 'available'
    | 'countdownActive'
    | 'countdownAmount'
    | 'countdownFinish'
  >;
  Auction: Pick<Auction, 'id' | 'status' | 'title' | 'mode' | 'startDate'>;
};

export type LangMap = Record<Lang, string>;

export interface ActionResponse {
  error: null | LangMap;
  success: null | LangMap;
}

export type VerificationToken =
  Database['public']['Tables']['VerificationToken']['Row'];

export interface UploadFile {
  src: string;
  name: string;
  type: string;
  arrayBuffer: string;
}

export interface AuctionStatusType {
  NOT_AVAILABLE: 'NOT_AVAILABLE';
  NEED_CHANGES: 'NEED_CHANGES';
  CHANGES_MADE: 'CHANGES_MADE';
  PARTIALLY_AVAILABLE: 'PARTIALLY_AVAILABLE';
  PARTIALLY_AVAILABLE_CHANGES_MADE: 'PARTIALLY_AVAILABLE_CHANGES_MADE';
  AVAILABLE: 'AVAILABLE';
  IN_REVIEW: 'IN_REVIEW';
  LIVE: 'LIVE';
  FINISHED: 'FINISHED';
  WAITING_MIN_ARTICLES_AMOUNT: 'WAITING_MIN_ARTICLES_AMOUNT';
}

export interface ArticleStatusType {
  NOT_PUBLISHED: 'NOT_PUBLISHED';
  NEED_CHANGES: 'NEED_CHANGES';
  CHANGES_MADE: 'CHANGES_MADE';
  APPROVED: 'APPROVED';
  PUBLISHED: 'PUBLISHED';
}

export type CalendarMonths = Record<string, MonthEntry>;

export interface MonthEntry {
  es: string;
  en: string;
  value: string | number;
}

export interface Comment {
  es: string;
  en: string;
}

export interface HamburgerMenuItem {
  path: string;
  role: string;
  authNeededToDisplay: boolean | undefined;
}

export interface UserMenuItem {
  path: string;
  role: string;
}

export type HamburgerMenuItems = Record<string, HamburgerMenuItem>;

export type UserMenuItems = Record<string, UserMenuItem>;

export interface NavBarMenuItemChild {
  name: string;
  path: string;
  subchildren?: boolean;
}
export interface NavBarMenuItem {
  path: string;
  role: string;
  childs?: NavBarMenuItemChild[];
}

export type NavBarMenuItems = Record<string, NavBarMenuItem>;

interface Comission {
  PERCENTAGE: number;
  THRESHOLD: number;
  LABEL: string;
}

export interface Comissions {
  // LOW: Comission;
  // MEDIUM_LOW: Comission;
  // MEDIUM: Comission;
  // MEDIUM_HIGH: Comission;
  // HIGH: Comission;
  STANDARD: Comission;
}

export interface ArticleStatusLabels {
  es: Record<keyof ArticleStatusType, string>;
  en: Record<keyof ArticleStatusType, string>;
}

export interface AuctionStatusLabels {
  es: Record<keyof AuctionStatusType, string>;
  en: Record<keyof AuctionStatusType, string>;
}

interface RoleType {
  value: string;
  label: string;
  description: string;
  icon: string;
  position: string;
  extraClass?: string;
}

export interface RolesTypes {
  user: RoleType;
  auctioneer: RoleType;
  'host-auctioneer': RoleType;
}

export const AuctionCategoriesConst: Record<AuctionCategories, string> = {
  BAGS: 'BAGS',
  JEWERLY: 'JEWERLY',
  WATCHES: 'WATCHES',
  ART: 'ART',
} as const;

export type AuctionCategories = Database['public']['Enums']['AuctionCategory'];

export const OfferStatusConst: Record<OfferStatus, string> = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export type OfferStatus = Database['public']['Enums']['OfferStatus'];

export const ArticleCategoriesConst: Record<ArticleCategories, string> = {
  BAG: 'BAG',
  JEWERLY: 'JEWERLY',
  WATCH: 'WATCH',
  ART: 'ART',
} as const;

export type ArticleCategories = Database['public']['Enums']['ArticleCategory'];

export const ArticleSecondChanceStatusConst: Record<
  ArticleSecondChanceStatus,
  string
> = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
} as const;

export type ArticleSecondChanceStatus =
  Database['public']['Enums']['ArticleSecondChanceStatus'];

export interface HighestBidderState {
  highestBidder: string | null;
  highestBidderImage: string | null;
  currentValue: number;
  available: boolean;
}

export type CountryValue =
  | 'ANDORRA'
  | 'AUSTRIA'
  | 'BELGIUM'
  | 'BULGARIA'
  | 'CROATIA'
  | 'CYPRUS'
  | 'CZECH_REPUBLIC'
  | 'DENMARK'
  | 'SPAIN'
  | 'ESTONIA'
  | 'FINLAND'
  | 'FRANCE'
  | 'GERMANY'
  | 'GREECE'
  | 'HUNGARY'
  | 'IRELAND'
  | 'ITALY'
  | 'LATVIA'
  | 'LITHUANIA'
  | 'LUXEMBOURG'
  | 'MALTA'
  | 'NETHERLANDS'
  | 'POLAND'
  | 'PORTUGAL'
  | 'ROMANIA'
  | 'SLOVAKIA'
  | 'SLOVENIA'
  | 'SWEDEN';

export interface CountryObject {
  label: string;
  value: CountryValue;
}

export interface Countries {
  es: CountryObject[];
  en: CountryObject[];
}

export interface PaymentShippingTax {
  GENERAL: number;
  SPAIN: number;
}

export interface AppliedDiscountCode {
  code: string;
  amount: number;
}

export interface AddressOption {
  value: string;
  label: string;
  country: string;
  data: string[];
}

export interface MyOffers {
  id: string;
  amount: number;
  status: OfferStatus;
  expiresAt: Date;
  ArticleSecondChance: {
    id: string;
    status: ArticleSecondChanceStatus;
    Article: {
      title: string;
      images: string[];
    };
  };
}

export interface CustomArticleLiveAuto
  extends Pick<Article, 'id' | 'estimatedValue' | 'title' | 'images'> {
  ArticleBid: Pick<ArticleBid, 'currentValue' | 'available'>;
  Bids: {
    count: number;
  }[];
}

export interface BiddingAmounts {
  maxAmountWithoutToast: number;
  minBid: number;
  tenPercent: number;
  twentyFivePercent: number;
  fiftyPercent: number;
}

export interface AuctionBrand {
  image: string;
  title: string;
  title2: string;
  description: string[];
}
