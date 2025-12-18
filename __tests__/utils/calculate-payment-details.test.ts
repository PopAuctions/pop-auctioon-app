import { calculatePaymentDetails } from '@/utils/calculate-payment-details';
import type { PaymentDetailsInput } from '@/utils/calculate-payment-details';

describe('calculatePaymentDetails', () => {
  const defaultShippingTaxes = {
    SPAIN: 10,
    FRANCE: 15,
    GERMANY: 20,
    GENERAL: 29,
  };

  describe('Basic calculations', () => {
    it('should calculate payment details correctly with all values', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 1000,
        selectedCountry: 'SPAIN',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
        discount: 50,
      };

      const result = calculatePaymentDetails(input);

      expect(result).toEqual({
        subtotal: 1000,
        commission: 125, // 1000 * 0.125 = 125
        shipping: 10, // SPAIN shipping
        discount: 50,
        total: 1085, // 1000 + 125 + 10 - 50 = 1085
      });
    });

    it('should calculate correctly without discount', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 500,
        selectedCountry: 'FRANCE',
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result).toEqual({
        subtotal: 500,
        commission: 50, // 500 * 0.10 = 50
        shipping: 15, // FRANCE shipping
        discount: 0,
        total: 565, // 500 + 50 + 15 = 565
      });
    });

    it('should handle zero articles amount', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 0,
        selectedCountry: 'SPAIN',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result).toEqual({
        subtotal: 0,
        commission: 0,
        shipping: 10,
        discount: 0,
        total: 10, // Only shipping
      });
    });
  });

  describe('Commission calculations', () => {
    it('should calculate commission with integer percentage', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 1000,
        selectedCountry: 'SPAIN',
        commissionPercentage: 15,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.commission).toBe(150); // 1000 * 0.15 = 150
    });

    it('should calculate commission with decimal percentage', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 1000,
        selectedCountry: 'SPAIN',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.commission).toBe(125); // 1000 * 0.125 = 125
    });

    it('should round commission to nearest integer', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 333,
        selectedCountry: 'SPAIN',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      // 333 * 0.125 = 41.625 → rounds to 42
      expect(result.commission).toBe(42);
    });

    it('should handle zero commission percentage', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 1000,
        selectedCountry: 'SPAIN',
        commissionPercentage: 0,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.commission).toBe(0);
    });
  });

  describe('Shipping calculations', () => {
    it('should use country-specific shipping cost', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 500,
        selectedCountry: 'GERMANY',
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.shipping).toBe(20); // GERMANY shipping
    });

    it('should use GENERAL shipping when country not selected', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 500,
        selectedCountry: null,
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.shipping).toBe(29); // GENERAL shipping
    });

    it('should use GENERAL shipping when country not in shipping taxes', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 500,
        selectedCountry: 'PORTUGAL' as any,
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.shipping).toBe(29); // Fallback to GENERAL
    });

    it('should use default 29 when GENERAL not in shipping taxes', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 500,
        selectedCountry: 'ITALY' as any,
        commissionPercentage: 10,
        shippingTaxes: { SPAIN: 10 }, // No GENERAL
      };

      const result = calculatePaymentDetails(input);

      expect(result.shipping).toBe(29); // Hardcoded default
    });

    it('should handle zero shipping cost', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 500,
        selectedCountry: 'SPAIN',
        commissionPercentage: 10,
        shippingTaxes: { SPAIN: 0, GENERAL: 29 },
      };

      const result = calculatePaymentDetails(input);

      expect(result.shipping).toBe(0);
    });
  });

  describe('Discount calculations', () => {
    it('should apply discount correctly', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 1000,
        selectedCountry: 'SPAIN',
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
        discount: 100,
      };

      const result = calculatePaymentDetails(input);

      expect(result.discount).toBe(100);
      expect(result.total).toBe(1010); // 1000 + 100 + 10 - 100 = 1010
    });

    it('should handle discount equal to subtotal + commission + shipping', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 100,
        selectedCountry: 'SPAIN',
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
        discount: 120, // 100 + 10 + 10 = 120
      };

      const result = calculatePaymentDetails(input);

      expect(result.total).toBe(0); // Total should be 0
    });

    it('should handle discount greater than total (negative total)', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 100,
        selectedCountry: 'SPAIN',
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
        discount: 200,
      };

      const result = calculatePaymentDetails(input);

      expect(result.total).toBe(-80); // 100 + 10 + 10 - 200 = -80
    });
  });

  describe('Precision and rounding', () => {
    it('should return numbers with max 2 decimal places', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 99.999,
        selectedCountry: 'SPAIN',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
        discount: 5.555,
      };

      const result = calculatePaymentDetails(input);

      expect(result.subtotal.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.commission.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.shipping.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.discount.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.total.toString()).toMatch(/^-?\d+(\.\d{1,2})?$/);
    });

    it('should handle floating point precision issues', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 0.1 + 0.2, // 0.30000000000000004 in JS
        selectedCountry: 'SPAIN',
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.subtotal).toBe(0.3);
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate correctly for multiple articles', () => {
      // Articles: 100€, 200€, 300€ = 600€ total
      const input: PaymentDetailsInput = {
        articlesAmount: 600,
        selectedCountry: 'FRANCE',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
        discount: 50,
      };

      const result = calculatePaymentDetails(input);

      expect(result).toEqual({
        subtotal: 600,
        commission: 75, // 600 * 0.125 = 75
        shipping: 15, // FRANCE
        discount: 50,
        total: 640, // 600 + 75 + 15 - 50 = 640
      });
    });

    it('should handle high-value auctions', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 10000,
        selectedCountry: 'GERMANY',
        commissionPercentage: 12.5,
        shippingTaxes: defaultShippingTaxes,
        discount: 500,
      };

      const result = calculatePaymentDetails(input);

      expect(result).toEqual({
        subtotal: 10000,
        commission: 1250, // 10000 * 0.125 = 1250
        shipping: 20,
        discount: 500,
        total: 10770, // 10000 + 1250 + 20 - 500 = 10770
      });
    });

    it('should handle low-value articles with shipping higher than subtotal', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 5,
        selectedCountry: null, // GENERAL shipping (29€)
        commissionPercentage: 10,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result).toEqual({
        subtotal: 5,
        commission: 1, // 5 * 0.10 = 0.5 → rounds to 1
        shipping: 29,
        discount: 0,
        total: 35,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty shipping taxes object', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 100,
        selectedCountry: 'SPAIN',
        commissionPercentage: 10,
        shippingTaxes: {},
        discount: 0,
      };

      const result = calculatePaymentDetails(input);

      expect(result.shipping).toBe(29); // Default fallback
    });

    it('should handle very small commission percentages', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 100,
        selectedCountry: 'SPAIN',
        commissionPercentage: 0.01,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.commission).toBe(0); // 100 * 0.0001 = 0.01 → rounds to 0
    });

    it('should handle very high commission percentages', () => {
      const input: PaymentDetailsInput = {
        articlesAmount: 100,
        selectedCountry: 'SPAIN',
        commissionPercentage: 100,
        shippingTaxes: defaultShippingTaxes,
      };

      const result = calculatePaymentDetails(input);

      expect(result.commission).toBe(100); // 100 * 1.0 = 100
      expect(result.total).toBe(210); // 100 + 100 + 10
    });
  });
});
