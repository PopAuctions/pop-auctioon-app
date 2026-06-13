import { calculatePaymentDetails } from '@/utils/calculate-payment-details';
import type { PaymentDetailsInput } from '@/utils/calculate-payment-details';

describe('calculatePaymentDetails', () => {
  const shippingTaxes = {
    SAME_COUNTRY: 10,
    DIFFERENT_COUNTRY: 29,
    GENERAL: 29,
    SPAIN: 10,
  };

  const makeInput = (
    overrides: Partial<PaymentDetailsInput> = {}
  ): PaymentDetailsInput => ({
    articlesAmount: 1000,
    selectedCountry: 'SPAIN',
    auctionCountry: 'SPAIN',
    commissionPercentage: 12.5,
    taxPercentageArticles: 21,
    shippingTaxes,
    discount: 0,
    ...overrides,
  });

  it('calculates subtotal, commission, taxes, shipping, and total', () => {
    const result = calculatePaymentDetails(makeInput({ discount: 50 }));

    expect(result).toEqual({
      subtotal: 1000,
      commission: 111.11,
      taxes: 23.33,
      shipping: 10,
      discount: 50,
      total: 983.33,
    });
  });

  it('uses DIFFERENT_COUNTRY shipping when the countries differ', () => {
    const result = calculatePaymentDetails(
      makeInput({
        articlesAmount: 500,
        selectedCountry: 'FRANCE',
        auctionCountry: 'ITALY',
        commissionPercentage: 10,
      })
    );

    expect(result.shipping).toBe(29);
    expect(result.commission).toBe(45.45);
    expect(result.taxes).toBe(9.55);
    expect(result.total).toBe(538.55);
  });

  it('uses SAME_COUNTRY shipping when the countries match', () => {
    const result = calculatePaymentDetails(
      makeInput({
        selectedCountry: 'SPAIN',
        auctionCountry: 'SPAIN',
        shippingTaxes: {
          ...shippingTaxes,
          SAME_COUNTRY: 12,
          DIFFERENT_COUNTRY: 39,
        },
      })
    );

    expect(result.shipping).toBe(12);
  });

  it('applies a zero commission cleanly', () => {
    const result = calculatePaymentDetails(
      makeInput({
        articlesAmount: 250,
        commissionPercentage: 0,
      })
    );

    expect(result.commission).toBe(0);
    expect(result.taxes).toBe(0);
    expect(result.total).toBe(260);
  });

  it('applies a zero tax percentage cleanly', () => {
    const result = calculatePaymentDetails(
      makeInput({
        articlesAmount: 250,
        taxPercentageArticles: 0,
      })
    );

    expect(result.taxes).toBe(0);
    expect(result.total).toBe(260);
  });

  it('handles a high-value auction with discount', () => {
    const result = calculatePaymentDetails(
      makeInput({
        articlesAmount: 10000,
        commissionPercentage: 12.5,
        taxPercentageArticles: 21,
        shippingTaxes: {
          ...shippingTaxes,
          SAME_COUNTRY: 10,
          DIFFERENT_COUNTRY: 20,
        },
        discount: 500,
        selectedCountry: 'GERMANY',
        auctionCountry: 'FRANCE',
      })
    );

    expect(result).toEqual({
      subtotal: 10000,
      commission: 1111.11,
      taxes: 233.33,
      shipping: 20,
      discount: 500,
      total: 9753.33,
    });
  });

  it('keeps two-decimal precision in all outputs', () => {
    const result = calculatePaymentDetails(
      makeInput({
        articlesAmount: 99.999,
        commissionPercentage: 12.5,
        taxPercentageArticles: 21,
        discount: 5.555,
      })
    );

    expect(result.subtotal.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(result.commission.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(result.taxes.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(result.shipping.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(result.discount.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(result.total.toString()).toMatch(/^-?\d+(\.\d{1,2})?$/);
  });

  it('handles low-value amounts without breaking rounding', () => {
    const result = calculatePaymentDetails(
      makeInput({
        articlesAmount: 5,
        commissionPercentage: 10,
        taxPercentageArticles: 21,
        selectedCountry: null,
        auctionCountry: null,
      })
    );

    expect(result).toEqual({
      subtotal: 5,
      commission: 0.45,
      taxes: 0.1,
      shipping: 29,
      discount: 0,
      total: 34.1,
    });
  });

  it('uses DIFFERENT_COUNTRY shipping when only one country is known', () => {
    const result = calculatePaymentDetails(
      makeInput({
        selectedCountry: null,
        auctionCountry: 'SPAIN',
        articlesAmount: 300,
        commissionPercentage: 10,
      })
    );

    expect(result.shipping).toBe(29);
  });

  it('uses DIFFERENT_COUNTRY shipping when the auction country is missing', () => {
    const result = calculatePaymentDetails(
      makeInput({
        selectedCountry: 'SPAIN',
        auctionCountry: null,
        articlesAmount: 300,
        commissionPercentage: 10,
      })
    );

    expect(result.shipping).toBe(29);
  });
});
