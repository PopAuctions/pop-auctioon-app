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
      articleSpecification: {
        state: {
          NEVER_WORN_WITH_TAG: 'Never Worn with Tag',
          NEVER_WORN: 'Never Worn',
          VERY_GOOD_CONDITION: 'Very Good Condition',
          GOOD_CONDITION: 'Good Condition',
          FAIR_CONDITION: 'Fair Condition',
        },
        stateDescription: {
          NEVER_WORN_WITH_TAG:
            'Like new, with the original tag still attached, and no signs of wear, damage, or modifications.',
          NEVER_WORN:
            'Flawless condition, showing no signs of wear, damage, or alterations.',
          VERY_GOOD_CONDITION:
            'Gently worn, carefully preserved with no rips, fuzzing, or fading.',
          GOOD_CONDITION:
            'Moderately used, still in good shape but may show minor fabric wear or small imperfections.',
          FAIR_CONDITION:
            'Heavily worn, with noticeable defects and signs of frequent use.',
        },
        smell: {
          TOBACCO: 'Tobacco',
          PERFUME: 'Perfume',
          HUMIDITY: 'Humidity',
          NO_SMELL: 'No smell',
          OTHER: 'Other',
        },
        movement: {
          AUTOMATIC: 'Automatic',
          QUARTZ: 'Quartz',
          MANUAL_WINDING: 'Manual winding',
          SMART_WATCH: 'Smartwatch',
          SOLAR: 'Solar',
          OTHER: 'Other',
        },
        artType: {
          OTHER: 'Other',
          ANTIQUE: 'Antique',
          CERAMIC: 'Ceramic',
          COLLECTIBLE: 'Collectible',
          DRAWING: 'Drawing',
          FURNITURE: 'Furniture',
          GLASS_ART: 'Glass Art',
          METAL_ART: 'Metal Art',
          PAINTING: 'Painting',
          SCULPTURE: 'Sculpture',
          WOOD_ART: 'Wood Art',
        },
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
    expect(es.displayLabels.articleSpecification.state.GOOD_CONDITION).toBe(
      'Buen Estado'
    );
    expect(
      es.displayLabels.articleSpecification.stateDescription.GOOD_CONDITION
    ).toBe(
      'Usado moderadamente, aún en buen estado pero puede mostrar un ligero desgaste del tejido o pequeñas imperfecciones.'
    );
    expect(es.displayLabels.articleSpecification.smell.NO_SMELL).toBe(
      'Sin olor'
    );
    expect(es.displayLabels.articleSpecification.movement.MANUAL_WINDING).toBe(
      'Cuerda manual'
    );
    expect(es.displayLabels.articleSpecification.artType.GLASS_ART).toBe(
      'Arte en vidrio'
    );
  });
});
