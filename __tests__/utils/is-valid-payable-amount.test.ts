import { isValidPayableAmount } from '@/utils/is-valid-payable-amount';

describe('isValidPayableAmount', () => {
  it.each([0.01, 100])('accepts a positive finite amount: %s', (amount) => {
    expect(isValidPayableAmount(amount)).toBe(true);
  });

  it.each([0, -0.01, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects an invalid payable amount: %s',
    (amount) => {
      expect(isValidPayableAmount(amount)).toBe(false);
    }
  );
});
