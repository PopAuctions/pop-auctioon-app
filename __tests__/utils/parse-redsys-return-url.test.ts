import { parseRedsysReturnUrl } from '@/utils/payments/parse-redsys-return-url';

describe('parseRedsysReturnUrl', () => {
  it('returns success for URLOK redirects', () => {
    const result = parseRedsysReturnUrl({
      url: 'popauctioonapp://payment-result?status=ok&order=1234567890AB',
      expectedOrderId: '1234567890AB',
    });

    expect(result).toEqual({
      success: true,
      type: 'success',
      redsysOrderId: '1234567890AB',
      returnUrl: 'popauctioonapp://payment-result?status=ok&order=1234567890AB',
      status: 'ok',
    });
  });

  it('returns an error for URLKO redirects', () => {
    const result = parseRedsysReturnUrl({
      url: 'popauctioonapp://payment-result?status=ko&order=1234567890AB',
      expectedOrderId: '1234567890AB',
    });

    expect(result.success).toBe(false);
    expect(result.type).toBe('error');
    expect(result.redsysOrderId).toBe('1234567890AB');

    if (result.type === 'error') {
      expect(result.error).toEqual({
        code: 'PAYMENT_FAILED',
        message: 'Payment failed or was rejected in Redsys',
      });
      expect(result.status).toBe('ko');
    }
  });

  it('detects order mismatches', () => {
    const result = parseRedsysReturnUrl({
      url: 'popauctioonapp://payment-result?status=ok&order=OTHERORDER12',
      expectedOrderId: '1234567890AB',
    });

    expect(result.success).toBe(false);
    expect(result.type).toBe('error');

    if (result.type === 'error') {
      expect(result.error.code).toBe('ORDER_MISMATCH');
    }
  });

  it('rejects invalid return urls', () => {
    const result = parseRedsysReturnUrl({
      url: 'not a url',
      expectedOrderId: '1234567890AB',
    });

    expect(result.success).toBe(false);
    expect(result.type).toBe('error');

    if (result.type === 'error') {
      expect(result.error.code).toBe('INVALID_RETURN_URL');
    }
  });
});
