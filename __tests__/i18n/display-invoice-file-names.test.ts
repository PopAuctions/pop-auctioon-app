import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

describe('centralized invoice fallback filenames', () => {
  it('preserves the existing English filenames', () => {
    expect(en.displayLabels.invoiceFileName).toEqual({
      COMMISSION_INVOICE: 'commission-invoice',
      LIQUIDATION_INVOICE: 'liquidation-invoice',
    });
  });

  it('preserves the existing Spanish filenames', () => {
    expect(es.displayLabels.invoiceFileName).toEqual({
      COMMISSION_INVOICE: 'fatura-comisión',
      LIQUIDATION_INVOICE: 'factura-liquidación',
    });
  });
});
