import { StoreSettlementSaleTypeType } from './types';

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
