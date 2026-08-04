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
  taxPercentageArticles: number;
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
  taxes: number;
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
    taxPercentageArticles = 21,
    discount = 0,
  } = input;

  // Subtotal = article price already includes buyer commission
  const subtotal = articlesAmount;

  // Commission included inside subtotal
  const includedCommission =
    subtotal - subtotal / (1 + commissionPercentage / 100);

  // VAT calculated over included commission
  const taxes = includedCommission * (taxPercentageArticles / 100);

  // Shipping calculation based on auction country from backend
  const defaultShipping = shippingTaxes.SAME_COUNTRY;
  let shipping = defaultShipping;

  if (auctionCountry && selectedCountry && auctionCountry !== selectedCountry) {
    shipping = shippingTaxes.DIFFERENT_COUNTRY;
  }

  // Total = subtotal + shipping - discount
  const total = subtotal + shipping - discount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    commission: Number(includedCommission.toFixed(2)),
    taxes: Number(taxes.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
