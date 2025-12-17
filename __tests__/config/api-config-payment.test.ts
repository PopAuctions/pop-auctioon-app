import { SECURE_ENDPOINTS, PROTECTED_ENDPOINTS } from '@/config/api-config';

describe('API Config - Payment Endpoints', () => {
  describe('SECURE_ENDPOINTS.PAYMENT', () => {
    it('should have CREATE_PAYMENT_INTENT endpoint', () => {
      expect(SECURE_ENDPOINTS.PAYMENT.CREATE_PAYMENT_INTENT).toBe(
        '/user/payments/create-intent'
      );
    });

    it('should have CREATE_ARTICLES_PAYMENT endpoint', () => {
      expect(SECURE_ENDPOINTS.PAYMENT.CREATE_ARTICLES_PAYMENT).toBe(
        '/user/payments/create-articles-payment'
      );
    });

    it('should have REJECT_ARTICLES_PAYMENT endpoint', () => {
      expect(SECURE_ENDPOINTS.PAYMENT.REJECT_ARTICLES_PAYMENT).toBe(
        '/user/payments/reject-articles-payment'
      );
    });

    it('should have INFO endpoint for payment configuration', () => {
      expect(SECURE_ENDPOINTS.PAYMENT.INFO).toBe('/payment-info');
    });

    it('should have COMMISSIONS endpoint', () => {
      expect(SECURE_ENDPOINTS.PAYMENT.COMMISSIONS).toBe('/payments/commission');
    });
  });

  describe('SECURE_ENDPOINTS.DISCOUNT', () => {
    it('should have VALIDATE function that generates correct endpoint', () => {
      const code = 'SUMMER20';
      const endpoint = SECURE_ENDPOINTS.DISCOUNT.VALIDATE(code);

      expect(endpoint).toBe('/user/payments/discount-code?code=SUMMER20');
    });

    it('should URL-encode discount code with special characters', () => {
      const code = 'TEST CODE!';
      const endpoint = SECURE_ENDPOINTS.DISCOUNT.VALIDATE(code);

      expect(endpoint).toContain(encodeURIComponent('TEST CODE!'));
    });

    it('should handle empty discount code', () => {
      const endpoint = SECURE_ENDPOINTS.DISCOUNT.VALIDATE('');

      expect(endpoint).toBe('/user/payments/discount-code?code=');
    });
  });

  describe('SECURE_ENDPOINTS.USER.WON_ARTICLES', () => {
    it('should generate correct endpoint with auctionId', () => {
      const auctionId = '123';
      const endpoint = SECURE_ENDPOINTS.USER.WON_ARTICLES(auctionId);

      expect(endpoint).toBe('/user/won-articles?auctionId=123');
    });

    it('should handle numeric auctionId', () => {
      const endpoint = SECURE_ENDPOINTS.USER.WON_ARTICLES('456');

      expect(endpoint).toBe('/user/won-articles?auctionId=456');
    });

    it('should handle empty auctionId', () => {
      const endpoint = SECURE_ENDPOINTS.USER.WON_ARTICLES('');

      expect(endpoint).toBe('/user/won-articles?auctionId=');
    });
  });

  describe('Endpoint consistency', () => {
    it('should have all payment endpoints under /user/payments', () => {
      expect(SECURE_ENDPOINTS.PAYMENT.CREATE_PAYMENT_INTENT).toContain(
        '/user/payments/'
      );
      expect(SECURE_ENDPOINTS.PAYMENT.CREATE_ARTICLES_PAYMENT).toContain(
        '/user/payments/'
      );
      expect(SECURE_ENDPOINTS.PAYMENT.REJECT_ARTICLES_PAYMENT).toContain(
        '/user/payments/'
      );
    });

    it('should have discount validation under /user/payments', () => {
      const endpoint = SECURE_ENDPOINTS.DISCOUNT.VALIDATE('CODE');
      expect(endpoint).toContain('/user/payments/discount-code');
    });

    it('should have won articles under /user', () => {
      const endpoint = SECURE_ENDPOINTS.USER.WON_ARTICLES('1');
      expect(endpoint).toContain('/user/won-articles');
    });
  });
});
