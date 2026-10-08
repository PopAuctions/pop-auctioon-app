import {
  OFFERS_OPTION_VALUE_ORDER,
  ONLINE_STORE_ARTICLE_STATUS_VALUES,
  PAID_FILTER_VALUE_ORDER,
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
    }).toEqual(expected);
  });
});
