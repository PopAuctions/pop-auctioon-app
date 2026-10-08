import {
  ARTICLE_COLOR_VALUES,
  ARTICLE_MATERIAL_FILTER_VALUES,
  ARTICLE_SMELL_VALUES,
  ARTICLE_STATE_VALUES,
  ART_TYPE_VALUES,
  OFFERS_OPTION_VALUE_ORDER,
  ONLINE_STORE_ARTICLE_STATUS_VALUES,
  PAID_FILTER_VALUE_ORDER,
  WATCH_MOVEMENT_VALUES,
} from '@/constants';
import { SELECTABLE_AUCTION_CATEGORIES } from '@/constants/auctions';
import { SORT_BY_VALUES } from '@/constants/onlineStore';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>
) {
  return values.map((value) => ({ value, label: labels[value] }));
}

describe.each([
  {
    dictionary: en,
    locale: 'en',
    expected: {
      sort: [
        { value: 'NEWEST', label: 'Newest' },
        { value: 'OLDEST', label: 'Oldest' },
        { value: 'HIGHER_PRICE', label: 'Highest price' },
        { value: 'LOWER_PRICE', label: 'Lowest price' },
      ],
      paid: [
        { value: 'ALL', label: 'All' },
        { value: 'NOT_PAID', label: 'Not paid' },
        { value: 'PAID_NOT_SHIPPED', label: 'Paid not shipped' },
        { value: 'PAID_SHIPPED', label: 'Paid shipped' },
      ],
      articleStatus: [
        { value: 'NOT_AVAILABLE', label: 'Not available' },
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'SOLD', label: 'Sold' },
      ],
      offers: [
        { value: 'ALL', label: 'All' },
        { value: 'WITH_ACCEPTED_OFFERS', label: 'With accepted offers' },
        { value: 'WITH_PENDING_OFFERS', label: 'With pending offers' },
        { value: 'WITHOUT_OFFERS', label: 'Without offers' },
      ],
      categories: [
        { value: 'BAGS', label: 'Bags' },
        { value: 'JEWERLY', label: 'Jewelry' },
        { value: 'WATCHES', label: 'Watches' },
        { value: 'ART', label: 'Art' },
      ],
      articleState: [
        { value: 'NEVER_WORN_WITH_TAG', label: 'Never Worn with Tag' },
        { value: 'NEVER_WORN', label: 'Never Worn' },
        { value: 'VERY_GOOD_CONDITION', label: 'Very Good Condition' },
        { value: 'GOOD_CONDITION', label: 'Good Condition' },
        { value: 'FAIR_CONDITION', label: 'Fair Condition' },
      ],
      smell: [
        { value: 'TOBACCO', label: 'Tobacco' },
        { value: 'PERFUME', label: 'Perfume' },
        { value: 'HUMIDITY', label: 'Humidity' },
        { value: 'OTHER', label: 'Other' },
        { value: 'NO_SMELL', label: 'No smell' },
      ],
      movement: [
        { value: 'AUTOMATIC', label: 'Automatic' },
        { value: 'QUARTZ', label: 'Quartz' },
        { value: 'MANUAL_WINDING', label: 'Manual winding' },
        { value: 'SMART_WATCH', label: 'Smartwatch' },
        { value: 'SOLAR', label: 'Solar' },
        { value: 'OTHER', label: 'Other' },
      ],
      artType: [
        { value: 'OTHER', label: 'Other' },
        { value: 'ANTIQUE', label: 'Antique' },
        { value: 'CERAMIC', label: 'Ceramic' },
        { value: 'COLLECTIBLE', label: 'Collectible' },
        { value: 'DRAWING', label: 'Drawing' },
        { value: 'FURNITURE', label: 'Furniture' },
        { value: 'GLASS_ART', label: 'Glass Art' },
        { value: 'METAL_ART', label: 'Metal Art' },
        { value: 'PAINTING', label: 'Painting' },
        { value: 'SCULPTURE', label: 'Sculpture' },
        { value: 'WOOD_ART', label: 'Wood Art' },
      ],
    },
  },
  {
    dictionary: es,
    locale: 'es',
    expected: {
      sort: [
        { value: 'NEWEST', label: 'Más reciente' },
        { value: 'OLDEST', label: 'Más antiguo' },
        { value: 'HIGHER_PRICE', label: 'Mayor precio' },
        { value: 'LOWER_PRICE', label: 'Menor precio' },
      ],
      paid: [
        { value: 'ALL', label: 'Todos' },
        { value: 'NOT_PAID', label: 'No pagados' },
        { value: 'PAID_NOT_SHIPPED', label: 'Pagados pero no enviados' },
        { value: 'PAID_SHIPPED', label: 'Pagados y enviados' },
      ],
      articleStatus: [
        { value: 'NOT_AVAILABLE', label: 'No disponible' },
        { value: 'AVAILABLE', label: 'Disponible' },
        { value: 'SOLD', label: 'Vendido' },
      ],
      offers: [
        { value: 'ALL', label: 'Todos' },
        { value: 'WITH_ACCEPTED_OFFERS', label: 'Con ofertas aceptadas' },
        { value: 'WITH_PENDING_OFFERS', label: 'Con ofertas pendientes' },
        { value: 'WITHOUT_OFFERS', label: 'Sin ofertas' },
      ],
      categories: [
        { value: 'BAGS', label: 'Bolsos' },
        { value: 'JEWERLY', label: 'Joyería' },
        { value: 'WATCHES', label: 'Relojes' },
        { value: 'ART', label: 'Arte' },
      ],
      articleState: [
        { value: 'NEVER_WORN_WITH_TAG', label: 'Nunca Usado con Etiqueta' },
        { value: 'NEVER_WORN', label: 'Nunca Usado' },
        { value: 'VERY_GOOD_CONDITION', label: 'Muy Buen Estado' },
        { value: 'GOOD_CONDITION', label: 'Buen Estado' },
        { value: 'FAIR_CONDITION', label: 'Estado Aceptable' },
      ],
      smell: [
        { value: 'TOBACCO', label: 'Tabaco' },
        { value: 'PERFUME', label: 'Perfume' },
        { value: 'HUMIDITY', label: 'Humedad' },
        { value: 'OTHER', label: 'Otro' },
        { value: 'NO_SMELL', label: 'Sin olor' },
      ],
      movement: [
        { value: 'AUTOMATIC', label: 'Automático' },
        { value: 'QUARTZ', label: 'Cuarzo' },
        { value: 'MANUAL_WINDING', label: 'Cuerda manual' },
        { value: 'SMART_WATCH', label: 'Reloj inteligente' },
        { value: 'SOLAR', label: 'Solar' },
        { value: 'OTHER', label: 'Otro' },
      ],
      artType: [
        { value: 'OTHER', label: 'Otro' },
        { value: 'ANTIQUE', label: 'Antigüedad' },
        { value: 'CERAMIC', label: 'Cerámica' },
        { value: 'COLLECTIBLE', label: 'Coleccionable' },
        { value: 'DRAWING', label: 'Dibujo' },
        { value: 'FURNITURE', label: 'Mueble' },
        { value: 'GLASS_ART', label: 'Arte en vidrio' },
        { value: 'METAL_ART', label: 'Arte en metal' },
        { value: 'PAINTING', label: 'Pintura' },
        { value: 'SCULPTURE', label: 'Escultura' },
        { value: 'WOOD_ART', label: 'Arte en madera' },
      ],
    },
  },
])('centralized $locale display options', ({ dictionary, expected }) => {
  it('preserves every existing value, label, and position', () => {
    expect({
      sort: toOptions(SORT_BY_VALUES, dictionary.displayLabels.sortBy),
      paid: toOptions(
        PAID_FILTER_VALUE_ORDER,
        dictionary.displayLabels.paidFilter
      ),
      articleStatus: toOptions(
        ONLINE_STORE_ARTICLE_STATUS_VALUES,
        dictionary.displayLabels.onlineStoreArticleStatus
      ),
      offers: toOptions(
        OFFERS_OPTION_VALUE_ORDER,
        dictionary.displayLabels.offersFilter
      ),
      categories: toOptions(
        SELECTABLE_AUCTION_CATEGORIES,
        dictionary.displayLabels.auctionCategorySelection
      ),
      articleState: toOptions(
        ARTICLE_STATE_VALUES,
        dictionary.displayLabels.articleSpecification.state
      ),
      smell: toOptions(
        ARTICLE_SMELL_VALUES,
        dictionary.displayLabels.articleSpecification.smell
      ),
      movement: toOptions(
        WATCH_MOVEMENT_VALUES,
        dictionary.displayLabels.articleSpecification.movement
      ),
      artType: toOptions(
        ART_TYPE_VALUES,
        dictionary.displayLabels.articleSpecification.artType
      ),
    }).toEqual(expected);
  });

  it('preserves color and material filter availability and order', () => {
    const colorOptions = toOptions(
      ARTICLE_COLOR_VALUES,
      dictionary.displayLabels.articleSpecification.color
    );
    const materialOptions = toOptions(
      ARTICLE_MATERIAL_FILTER_VALUES,
      dictionary.displayLabels.articleSpecification.material
    );

    expect(colorOptions).toHaveLength(24);
    expect(colorOptions[0]).toEqual({
      value: 'MULTICOLOUR',
      label: dictionary.displayLabels.articleSpecification.color.MULTICOLOUR,
    });
    expect(colorOptions.at(-1)).toEqual({
      value: 'YELLOW',
      label: dictionary.displayLabels.articleSpecification.color.YELLOW,
    });
    expect(materialOptions).toHaveLength(44);
    expect(materialOptions.map(({ value }) => value)).not.toContain('CANVAS');
    expect(materialOptions[0]).toEqual({
      value: 'CASHMERE',
      label: dictionary.displayLabels.articleSpecification.material.CASHMERE,
    });
    expect(materialOptions.at(-1)).toEqual({
      value: 'YELLOW_GOLD',
      label: dictionary.displayLabels.articleSpecification.material.YELLOW_GOLD,
    });
  });
});
