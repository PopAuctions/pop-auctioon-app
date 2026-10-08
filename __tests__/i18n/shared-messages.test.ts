import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

describe.each([
  ['en', en, '%{min}'],
  ['es', es, '%{min}'],
] as const)('%s shared messages', (_locale, dictionary, minPlaceholder) => {
  it('exposes common UI namespaces', () => {
    expect(dictionary.common.actions.retry).toBeDefined();
    expect(dictionary.common.status.loading).toBeDefined();
    expect(dictionary.common.toast.error).toBeDefined();
    expect(dictionary.errors.unexpected).toBeDefined();
    expect(dictionary.errorBoundary.description).toBeDefined();
    expect(dictionary.notFound.description).toBeDefined();
    expect(dictionary.validation.minLength).toContain(minPlaceholder);
  });
});

describe('centralized display labels', () => {
  it('preserves the existing English status and payout labels', () => {
    expect(en.displayLabels).toEqual({
      paymentStatus: {
        PENDING: 'Processing',
        APPROVED: 'Paid',
        REJECTED: 'Rejected',
      },
      articleStatus: {
        NOT_PUBLISHED: 'Not published',
        NEED_CHANGES: 'Needs changes',
        CHANGES_MADE: 'Changes made',
        APPROVED: 'Approved',
        PUBLISHED: 'Published',
      },
      onlineStoreArticleStatus: {
        NOT_AVAILABLE: 'Not available',
        AVAILABLE: 'Available',
        SOLD: 'Sold',
      },
      offerStatus: {
        PENDING: 'Pending',
        ACCEPTED: 'Accepted',
        REJECTED: 'Rejected',
        COUNTERED: 'Countered',
      },
      saleType: {
        AUCTION: 'Auction',
        ONLINE_STORE: 'Online store',
      },
      payoutMethod: {
        CASH: 'Cash',
        BANK_TRANSFER: 'Bank transfer',
        PAYPAL: 'PayPal',
        STRIPE: 'Stripe',
      },
      payoutStatus: {
        PAID: 'Paid',
        CANCELLED: 'Cancelled',
      },
    });
  });

  it('preserves the existing Spanish labels and offer-status variants', () => {
    expect(es.displayLabels.paymentStatus.APPROVED).toBe('Pagado');
    expect(es.displayLabels.articleStatus.NEED_CHANGES).toBe(
      'Necesita cambios'
    );
    expect(es.displayLabels.onlineStoreArticleStatus.SOLD).toBe('Vendido');
    expect(es.displayLabels.offerStatus.ACCEPTED).toBe('Aceptada');
    expect(es.components.offerCard.status.ACCEPTED).toBe('Aceptado');
    expect(es.displayLabels.saleType.ONLINE_STORE).toBe('Tienda online');
    expect(es.displayLabels.payoutMethod.BANK_TRANSFER).toBe(
      'Transferencia bancaria'
    );
    expect(es.displayLabels.payoutStatus.CANCELLED).toBe('Cancelado');
  });
});
