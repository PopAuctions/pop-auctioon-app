import type { CountryValue } from '@/types/types';
import {
  getShippingTax,
  getCommissionsValue,
  TAX_PERCENTAGE,
} from '@/constants/payment';

/**
 * Input parameters for payment calculation
 */
export interface PaymentDetailsInput {
  /** Sum of soldPrice for selected articles */
  articlesAmount: number;
  /** Selected country for shipping address */
  selectedCountry: CountryValue | null;
  /** Discount amount (absolute value, not percentage) */
  discount?: number;
}

/**
 * Calculated payment breakdown
 */
export interface PaymentDetails {
  /** Subtotal (articles amount) */
  subtotal: number;
  /** Commission fee (IVA included) */
  commission: number;
  /** Shipping cost based on country */
  shipping: number;
  /** Discount applied */
  discount: number;
  /** Final total amount */
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
 *   discount: 50,
 * });
 * // {
 * //   subtotal: 1000,
 * //   commission: 151.56,
 * //   shipping: 10,
 * //   discount: 50,
 * //   total: 1111.56
 * // }
 * ```
 */
export function calculatePaymentDetails(
  input: PaymentDetailsInput
): PaymentDetails {
  const { articlesAmount, selectedCountry, discount = 0 } = input;

  // Subtotal = suma de precios de artículos
  const subtotal = articlesAmount;

  // Commission calculation (with VAT included)
  const commissionsValue = getCommissionsValue();
  const commissionPercentage = commissionsValue.STANDARD.PERCENTAGE; // 0.125 (12.5%)
  const taxPercentage = TAX_PERCENTAGE; // 0.21 (21% IVA)

  const commissionWithoutTax = subtotal * commissionPercentage;
  const commission = commissionWithoutTax * (1 + taxPercentage);

  // Shipping calculation based on country
  // Default to GENERAL (like web) if no country selected
  const shippingTax = getShippingTax();
  let shipping = shippingTax.GENERAL; // Default 29€

  if (selectedCountry) {
    shipping =
      selectedCountry === 'SPAIN' ? shippingTax.SPAIN : shippingTax.GENERAL;
  }

  // Total = subtotal + commission + shipping - discount
  const total = subtotal + commission + shipping - discount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    commission: Number(commission.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
