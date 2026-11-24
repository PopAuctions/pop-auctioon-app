import type { MessageKey } from '@/i18n';

export const PAYMENT_TOAST_KEYS = {
  discountApplied: 'screens.payment.discountApplied',
  discountRemoved: 'screens.payment.discountRemoved',
  noItemsSelected: 'screens.payment.noItemsSelected',
  noPendingItems: 'screens.payment.noPendingItems',
  selectShippingAddress: 'screens.payment.selectShippingAddress',
  paymentSessionPreparationFailed:
    'screens.payment.paymentSessionPreparationFailed',
  paymentRecordCreationFailed: 'screens.payment.paymentRecordCreationFailed',
  unexpectedProcessingError: 'screens.payment.unexpectedProcessingError',
  invalidDiscountAmount: 'screens.payment.invalidDiscountAmount',
} as const satisfies Record<string, MessageKey>;

export const INVALID_DISCOUNT_AMOUNT_ERROR =
  PAYMENT_TOAST_KEYS.invalidDiscountAmount;
