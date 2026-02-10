import type { CountryValue, PaymentShippingTax } from '@/types/types';

/**
 * Input parameters for payment calculation
 */
export interface PaymentDetailsInput {
  /** Sum of soldPrice for selected articles */
  articlesAmount: number;
  /** Selected country for shipping address */
  selectedCountry: CountryValue | null;
  /** Country of the auction */
  auctionCountry: CountryValue | null;
  /** Commission percentage (from useFetchCommissions hook) */
  commissionPercentage: number;
  /** Shipping taxes by country (from useFetchCommissions hook) */
  shippingTaxes: PaymentShippingTax;
  /** Discount amount (absolute value, not percentage) */
  discount?: number;
}

/**
 * Calculated payment breakdown
 */
export interface PaymentDetails {
  /** Subtotal (articles amount) */
  subtotal: number;
  /** Commission fee (WITHOUT VAT - matches web) */
  commission: number;
  /** Shipping cost based on country */
  shipping: number;
  /** Discount applied */
  discount: number;
  /** Final total amount in euros (backend converts to cents) */
  total: number;
}

/**
 * Calculate payment details breakdown
 * Matches web implementation logic from Next.js
 *
 * @param input - Payment calculation parameters
 * @returns Detailed payment breakdown
 *
 * @example
 * ```typescript
 * const details = calculatePaymentDetails({
 *   articlesAmount: 1000,
 *   selectedCountry: 'SPAIN',
 *   commissionPercentage: 12.5,
 *   discount: 50,
 * });
 * // {
 * //   subtotal: 1000,
 * //   commission: 125,
 * //   shipping: 10,
 * //   discount: 50,
 * //   total: 1085
 * // }
 * ```
 */
export function calculatePaymentDetails(
  input: PaymentDetailsInput
): PaymentDetails {
  const {
    articlesAmount,
    selectedCountry,
    auctionCountry,
    commissionPercentage,
    shippingTaxes,
    discount = 0,
  } = input;

  // Subtotal = suma de precios de artículos
  const subtotal = articlesAmount;

  // Commission calculation (WITHOUT VAT - matches web behavior)
  // commissionPercentage viene del hook useFetchCommissions (ej: 12.5 para 12.5%)
  const commission = Math.round(subtotal * (commissionPercentage / 100));

  // Shipping calculation based on country from backend
  // Default to GENERAL (29€) if no country selected or no shipping data
  const defaultShipping = shippingTaxes.DIFFERENT_COUNTRY;
  let shipping = defaultShipping;

  if (auctionCountry === selectedCountry) {
    shipping = shippingTaxes.SAME_COUNTRY;
  }

  // Total = subtotal + commission + shipping - discount
  const total = subtotal + commission + shipping - discount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    commission: Number(commission.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)), // Backend convierte a centavos
  };
}
