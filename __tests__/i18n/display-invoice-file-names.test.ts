import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

const INVOICE_FILE_NAME_KEYS = [
  'COMMISSION_INVOICE',
  'LIQUIDATION_INVOICE',
] as const;

describe.each([
  ['en', en],
  ['es', es],
] as const)(
  '%s centralized invoice fallback filenames',
  (_locale, dictionary) => {
    it('contains every required filename as a non-empty string', () => {
      expect(
        Object.keys(dictionary.displayLabels.invoiceFileName).sort()
      ).toEqual([...INVOICE_FILE_NAME_KEYS].sort());

      for (const key of INVOICE_FILE_NAME_KEYS) {
        expect(typeof dictionary.displayLabels.invoiceFileName[key]).toBe(
          'string'
        );
        expect(
          dictionary.displayLabels.invoiceFileName[key].length
        ).toBeGreaterThan(0);
      }
    });
  }
);
