import { STORE_INVOICE_TYPES } from '@/constants/store';
import {
  Article,
  Auction,
  Store,
  StorePayout,
  StoreSettlementItem,
  StoreSettlementSaleTypeType,
  StoreSettlementShipping,
  UserPayment,
} from './types';

export interface AuctionPendingPayout {
  auctionId: number;
  auctionTitle: string;
  articleCount: number;
  articleNetAmount: number;
  shippingAmount: number;
  totalAmount: number;
  payableAt: string;
}

export interface OnlineStorePendingPayout {
  settlementItemId: string;
  articleId: number;
  articleTitle: string;
  articleImage: string | null;
  articleNetAmount: number;
  shippingAmount: number;
  totalAmount: number;
  payableAt: string;
}

export interface AuctioneerPayoutHistory {
  payoutId: string;
  saleType: StoreSettlementSaleTypeType;
  sourceName: string;
  paidAt: string;
  totalAmount: number;
  totalItems: number;
}

export interface AuctioneerPayoutDashboard {
  auctionPendingPayouts: AuctionPendingPayout[];
  onlineStorePendingPayouts: OnlineStorePendingPayout[];
  payoutHistory: AuctioneerPayoutHistory[];
}

export type StorePayoutWithItems = StorePayout & {
  Store: Pick<Store, 'id' | 'name' | 'logo' | 'phoneNumber'> | null;
  StoreSettlementItem: StoreSettlementItemWithRelations[];
  StoreSettlementShipping?: Pick<
    StoreSettlementShipping,
    'id' | 'userPaymentId' | 'shippingAmount' | 'status' | 'paidAt'
  >[];
};

export type StoreSettlementItemWithRelations = StoreSettlementItem & {
  Store: Pick<Store, 'id' | 'name' | 'logo' | 'phoneNumber'> | null;
  Article:
    | (Pick<Article, 'id' | 'title' | 'images' | 'brand' | 'auctionId'> & {
        Auction: Pick<Auction, 'id' | 'title'> | null;
      })
    | null;
  UserPayment: Pick<
    UserPayment,
    'id' | 'createdAt' | 'totalAmount' | 'receiptUrl'
  > | null;
};

export type StoreInvoiceTypes = keyof typeof STORE_INVOICE_TYPES;
