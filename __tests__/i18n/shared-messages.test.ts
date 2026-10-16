import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

const DISPLAY_LABEL_NAMESPACES = [
  'articleSpecification',
  'articleStatus',
  'auctionCategory',
  'auctionCategorySelection',
  'auctionMode',
  'auctionStatus',
  'calendarMonth',
  'country',
  'invoiceFileName',
  'offerStatus',
  'offersFilter',
  'onlineStoreArticleStatus',
  'paidFilter',
  'paymentStatus',
  'payoutMethod',
  'payoutStatus',
  'saleType',
  'sortBy',
] as const;

const DISPLAY_LABEL_KEYS = {
  articleStatus: [
    'NOT_PUBLISHED',
    'NEED_CHANGES',
    'CHANGES_MADE',
    'APPROVED',
    'PUBLISHED',
  ],
  offerStatus: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'],
  onlineStoreArticleStatus: ['NOT_AVAILABLE', 'AVAILABLE', 'SOLD'],
  paymentStatus: ['PENDING', 'APPROVED', 'REJECTED'],
  payoutMethod: ['CASH', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE'],
  payoutStatus: ['PAID', 'CANCELLED'],
  saleType: ['AUCTION', 'ONLINE_STORE'],
} as const;

function dictionaryShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(dictionaryShape);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, dictionaryShape(child)])
    );
  }

  return typeof value;
}

describe.each([
  ['en', en],
  ['es', es],
] as const)('%s shared messages', (_locale, dictionary) => {
  it('exposes the shared UI messages and interpolation contracts', () => {
    expect(typeof dictionary.common.actions.retry).toBe('string');
    expect(typeof dictionary.common.status.loading).toBe('string');
    expect(typeof dictionary.common.toast.error).toBe('string');
    expect(typeof dictionary.errors.unexpected).toBe('string');
    expect(typeof dictionary.errorBoundary.description).toBe('string');
    expect(typeof dictionary.notFound.description).toBe('string');
    expect(dictionary.validation.minLength).toContain('%{min}');
  });

  it('contains every centralized display-label namespace', () => {
    expect(Object.keys(dictionary.displayLabels).sort()).toEqual(
      [...DISPLAY_LABEL_NAMESPACES].sort()
    );
  });

  it('contains every required status and payout label', () => {
    for (const [namespace, expectedKeys] of Object.entries(
      DISPLAY_LABEL_KEYS
    )) {
      const labels = dictionary.displayLabels[
        namespace as keyof typeof DISPLAY_LABEL_KEYS
      ] as Record<string, string>;

      expect(Object.keys(labels).sort()).toEqual([...expectedKeys].sort());
      for (const label of Object.values(labels)) {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('dictionary structure', () => {
  it('keeps every locale key and value type in sync', () => {
    expect(dictionaryShape(es)).toEqual(dictionaryShape(en));
  });
});
