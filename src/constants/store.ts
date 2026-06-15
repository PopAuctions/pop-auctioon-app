import {
  Lang,
  StorePayoutMethod,
  StorePayoutMethodType,
  StorePayoutStatusType,
  StoreSettlementSaleTypeType,
  StoreSettlementStatusFilter,
  StoreSettlementStatusType,
} from '@/types/types';

export const STORE_SETTLEMENT_STATUS_FILTERS_MAP: Record<
  Lang,
  Record<StoreSettlementStatusFilter, string>
> = {
  en: {
    PENDING: 'Pending',
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
    PROBLEM: 'Discrepancy',
    ALL: 'All',
  },
  es: {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
    PROBLEM: 'Discrepancia',
    ALL: 'Todos',
  },
};

export const SALE_TYPE_MAP: Record<
  Lang,
  Record<StoreSettlementSaleTypeType, string>
> = {
  es: {
    AUCTION: 'Subasta',
    ONLINE_STORE: 'Tienda online',
  },
  en: {
    AUCTION: 'Auction',
    ONLINE_STORE: 'Online store',
  },
};

export const PAYOUT_METHOD_OPTIONS: Record<
  Lang,
  { value: StorePayoutMethod; label: string }[]
> = {
  es: [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'BANK_TRANSFER', label: 'Transferencia bancaria' },
    { value: 'STRIPE', label: 'Stripe' },
    { value: 'PAYPAL', label: 'PayPal' },
  ],
  en: [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK_TRANSFER', label: 'Bank transfer' },
    { value: 'STRIPE', label: 'Stripe' },
    { value: 'PAYPAL', label: 'PayPal' },
  ],
};

export const STORE_PAYOUT_METHOD_MAP: Record<
  Lang,
  Record<StorePayoutMethodType, string>
> = {
  en: {
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank transfer',
    PAYPAL: 'PayPal',
    STRIPE: 'Stripe',
  },
  es: {
    CASH: 'Efectivo',
    BANK_TRANSFER: 'Transferencia bancaria',
    PAYPAL: 'PayPal',
    STRIPE: 'Stripe',
  },
};

export const STORE_PAYOUT_STATUS_MAP: Record<
  Lang,
  Record<StorePayoutStatusType, string>
> = {
  en: {
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
  },
  es: {
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
  },
};

export const StoreSettlementStatus: Record<
  StoreSettlementStatusType,
  StoreSettlementStatusType
> = {
  PENDING: 'PENDING',
  PROBLEM: 'PROBLEM',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export const StorePayoutStatus: Record<
  StorePayoutStatusType,
  StorePayoutStatusType
> = {
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export const StoreSettlementSaleType: Record<
  StoreSettlementSaleTypeType,
  StoreSettlementSaleTypeType
> = {
  ONLINE_STORE: 'ONLINE_STORE',
  AUCTION: 'AUCTION',
} as const;
